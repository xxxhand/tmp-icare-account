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
	const defBody: IBody = {
		account: '',
		password: '',
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
		oAccount.password = CustomUtils.hashPassword('a123456b', oAccount.salt);
		oAccount = await accountRepo.save(oAccount) as AccountEntity;

		defBody.account = oAccount.account;
		defBody.password = 'a123456b';

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
		let existedLunaAccount: AccountEntity;
		beforeAll(async () => {
			existedLunaAccount = new AccountEntity();
			existedLunaAccount.account = 'luna_xxxhandFromLuna';
			existedLunaAccount.name = 'xxxhand in luna';
			existedLunaAccount.nickname = 'hand in luna';
			existedLunaAccount.isLuna = true;
			existedLunaAccount.salt = CustomUtils.generateRandomString(9);
			existedLunaAccount.password = CustomUtils.hashPassword('a123456b', existedLunaAccount.salt);
			existedLunaAccount.lineId = 'aabc';
			existedLunaAccount = await accountRepo.save(existedLunaAccount) as AccountEntity;
		});
		test.skip('[Luna] 第一次登入，應建立資料', async () => {
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
		test.skip('[Luna] 第二次登入，不應建立/變更資料', async () => {
			const bb: IBody = {
				account: 'xxxhandFromLuna',
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
