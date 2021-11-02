import * as superTest from 'supertest';
import { mock } from 'jest-mock-extended';
import {
	CustomError,
	CustomUtils,
	defaultContainer,
	IMongooseClient,
	commonInjectorCodes,
	ErrorCodes,
	HttpCodes,
	ICustomHttpClient,
	CustomResult,
} from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { ErrorCodes as domainErr } from '../src/domain/enums/error-codes';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { AccountEntity } from '../src/domain/entities/account-entity';
import { IAccountRepository } from '../src/domain/repositories/i-account-repository';
import { ILoginLunaUser, ILunaLoginResult } from '../src/infra/types/luna-api-types';

const _ENDPOINT = '/line_io/api/v1/login';
interface IBody {
	account: string;
	password: string;
	lineId: string;
};

describe('Line io - login spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let db: IMongooseClient;
	let accountRepo: IAccountRepository;
	let oAccount: AccountEntity;
	let existedLunaAccount: AccountEntity;
	let existedPwd = CustomUtils.makeSha256('a123456b');
	const defBody: IBody = {
		account: '',
		password: CustomUtils.makeSha256('a123456b'),
		lineId: CustomUtils.generateRandomString(16),
	};
	beforeAll(async () => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		accountRepo = defaultContainer.get(InjectorCodes.I_ACCOUNT_REPO);

		oAccount = new AccountEntity();
		oAccount.account = '0987654321';
		oAccount.name = 'account with name';
		oAccount.salt = CustomUtils.generateRandomString(9);
		oAccount.password = CustomUtils.hashPassword(defBody.password, oAccount.salt);
		oAccount = await accountRepo.save(oAccount) as AccountEntity;

		defBody.account = oAccount.account;

		existedLunaAccount = new AccountEntity();
		existedLunaAccount.account = 'luna_xxxhandFromLuna';
		existedLunaAccount.name = 'xxxhand in luna';
		existedLunaAccount.nickname = 'hand in luna';
		existedLunaAccount.isLuna = true;
		existedLunaAccount.salt = CustomUtils.generateRandomString(9);
		existedLunaAccount.password = CustomUtils.hashPassword(existedPwd, existedLunaAccount.salt);
		existedLunaAccount.lineId = 'aabc';
		existedLunaAccount.phone = '0987654345';
		existedLunaAccount = await accountRepo.save(existedLunaAccount) as AccountEntity;

		//#region Mock luna login api call
		const failResult = new CustomResult()
			.withResult(JSON.stringify({
				success: false,
				errors: {
					account: {
						message: '帳號密碼不符',
					},
				},
			}));
		const inLunaResultOnce = new CustomResult()
			.withResult(JSON.stringify({
				success: true,
				data: {
					user: {
						name: 'handFromLuna',
						photo: CustomUtils.generateUUIDV4(),
						birthDate: new Date(),
						mobile: `09${CustomUtils.generateRandomNumbers(8)}`,
						personalId: 'Q123211234',
						gender: 0,
					},
				},
			}));
		const inLunaResultTwice = new CustomResult()
			.withResult(JSON.stringify({
				success: true,
				data: {
					user: {
						name: 'xxxhandFromLuna',
						photo: CustomUtils.generateUUIDV4(),
						birthDate: new Date(),
						mobile: `09${CustomUtils.generateRandomNumbers(8)}`,
						personalId: 'Q123211234',
						gender: 0,
					},
				},
			}));

		const http = mock<ICustomHttpClient>();
		http.tryPostJson
			.mockResolvedValueOnce(failResult)
			.mockResolvedValueOnce(inLunaResultOnce)
			.mockResolvedValueOnce(inLunaResultTwice)
			.mockResolvedValueOnce(failResult);
		defaultContainer
			.rebind<ICustomHttpClient>(commonInjectorCodes.I_HTTP_CLIENT)
			.toConstantValue(http)
			.whenTargetNamed(InjectorCodes.LUNA_HTTP_CLIENT);
		//#endregion
	});
	afterAll(async () => {
		await db.clearData();
		await db.close();
	});
	describe('Required fields', () => {
		test('[10008] 帳號為空', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.account = '';

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_ACCOUNT_EMPTY);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10009] 密碼為空', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.password = '';

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_ACCOUNT_PASS_WRONG);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10005] Line id不得為空', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.lineId = '';

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_LINE_ID_EMPTY);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
	});
	describe('Validation rules', () => {
		test('[10009] 帳號或密碼錯誤', async () => {
			const bb: IBody = {
				account: '0978665443',
				password: 'aA123456',
				lineId: CustomUtils.generateRandomString(16),
			};
			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_ACCOUNT_PASS_WRONG);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
	});
	describe('Success', () => {
		test('[Luna] 第一次登入，應建立資料', async () => {
			const bb: IBody = {
				account: 'handFromLuna',
				password: 'aA123456',
				lineId: CustomUtils.generateRandomString(16),
			};
			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			expect(res.status).toBe(200);
			const acc = await accountRepo.findOneByAccount(`luna_${bb.account}`) as AccountEntity;
			expect(acc).toBeTruthy();
			expect(acc.isLuna).toBe(true);
			expect(acc.lineId).toBe(bb.lineId);
		});
		test('[Luna] 第二次登入，僅變更line id', async () => {
			const bb: IBody = {
				account: 'xxxhandFromLuna',
				password: existedPwd,
				lineId: CustomUtils.generateRandomString(16),
			};
			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			expect(res.status).toBe(200);
			const acc = await accountRepo.findOneByAccount(`luna_${bb.account}`) as AccountEntity;
			expect(acc).toBeTruthy();
			expect(acc.isLuna).toBe(true);
			expect(acc.lineId).toBe(bb.lineId);
			expect(acc.name).toBe(existedLunaAccount.name);
			expect(acc.phone).toBe(existedLunaAccount.phone);
		});
		test('[iLearn]', async () => {
			const res = await agentClient
				.post(_ENDPOINT)
				.send(defBody);

			expect(res.status).toBe(200);
			const acc = await accountRepo.findOneByAccount(defBody.account) as AccountEntity;
			expect(acc).toBeTruthy();
			expect(acc.isLuna).toBe(false);
			expect(acc.lineId).toBe(defBody.lineId);
		});
		test.todo('Switch line rich menu');
	});
});
