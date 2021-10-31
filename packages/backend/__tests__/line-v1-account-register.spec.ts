
import * as superTest from 'supertest';
import {
	CustomError,
	defaultContainer,
	IMongooseClient,
	commonInjectorCodes,
	CustomUtils,
	CustomValidator,
} from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { ErrorCodes as domainErr } from '../src/domain/enums/error-codes';
import { ExpirationCodes } from '../src/domain/enums/expiration-codes';
import { AccountEntity } from '../src/domain/entities/account-entity';
import { IAccountRepository } from '../src/domain/repositories/i-account-repository';
import { CodeEntity } from '../src/domain/entities/code-entity';
import { ICodeRepository } from '../src/domain/repositories/i-code-repository';

const _ENDPOINT = '/line_io/api/v1/accounts';
interface IBody {
	phone: string;
	name: string;
	password: string;
	code: string;
	lineId: string;
}

describe('Line io - register account spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let db: IMongooseClient;
	let codeRepo: ICodeRepository;
	let accountRepo: IAccountRepository;
	let validCode: CodeEntity;
	let defBody: IBody = {
		phone: `09${CustomUtils.generateRandomNumbers(8)}`,
		name: 'xxxhand',
		password: 'nn0989HG',
		code: '',
		lineId: CustomUtils.generateRandomString(16),
	};
	beforeAll(async () => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		accountRepo = defaultContainer.get(InjectorCodes.I_ACCOUNT_REPO);
		codeRepo = defaultContainer.get(InjectorCodes.I_CODE_REPO);

		validCode = new CodeEntity();
		validCode.phone = defBody.phone;
		validCode.refesh(CustomUtils.generateRandomNumbers(4));
		validCode = await codeRepo.save(validCode) as CodeEntity;

		defBody.code = validCode.code;
	});
	afterAll(async () => {
		await db.clearData();
		await db.close();
	});
	describe('Required fields', () => {
		test('[10001] 手機格式錯誤', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.phone = '786545';

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_PHONE_FORMAT_WRONG);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10002] 姓名不得為空', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.name = '';

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_NAME_EMPTY);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10003] 密碼格式錯誤(空白)', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.password = '';

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_PASS_WRONG_FORMAT);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10003] 密碼格式錯誤(不符密碼原則，原則為英+數，不得包含特殊符號字元)', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.password = '786545#';

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_PASS_WRONG_FORMAT);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10004] 驗證碼錯誤(空白)', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.code = '';

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_CODE_WRONG);
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
		let expiredCode: CodeEntity;
		let withNameCode: CodeEntity;
		let noNameCode: CodeEntity;
		let accountWithName: AccountEntity;
		let accountNoName: AccountEntity;
		beforeAll(async () => {
			accountWithName = new AccountEntity();
			accountWithName.account = `09${CustomUtils.generateRandomNumbers(8)}`;
			accountWithName.name = 'account with name';
			accountWithName.salt = CustomUtils.generateRandomString(9);
			accountWithName.password = CustomUtils.hashPassword('a123456b', accountWithName.salt);
			accountWithName = await accountRepo.save(accountWithName) as AccountEntity;

			accountNoName = new AccountEntity();
			accountNoName.account = `09${CustomUtils.generateRandomNumbers(8)}`;
			accountNoName.name = '';
			accountNoName.salt = CustomUtils.generateRandomString(9);
			accountNoName.password = CustomUtils.hashPassword('a123456b', accountNoName.salt);
			accountNoName = await accountRepo.save(accountNoName) as AccountEntity;

			expiredCode = new CodeEntity();
			expiredCode.phone = `09${CustomUtils.generateRandomNumbers(8)}`;
			expiredCode.refesh(CustomUtils.generateRandomNumbers(4));
			expiredCode.expiresAt = Date.now() - (ExpirationCodes.VERIFY_CODE * 1000);

			withNameCode = new CodeEntity();
			withNameCode.phone = accountWithName.account;
			withNameCode.refesh(CustomUtils.generateRandomNumbers(4));

			noNameCode = new CodeEntity();
			noNameCode.phone = accountNoName.account;
			noNameCode.refesh(CustomUtils.generateRandomNumbers(4));

			await Promise.all([
				codeRepo.save(expiredCode),
				codeRepo.save(withNameCode),
				codeRepo.save(noNameCode)
			]);

		});
		test('[10004] 驗證碼錯誤(過期)', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.phone = expiredCode.phone;
			bb.code = expiredCode.code;

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_CODE_WRONG);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10006] 帳號已存在且原資料有姓名', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.phone = accountWithName.account;
			bb.code = withNameCode.code;

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_ACCOUNT_EXISTS);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10006] 帳號已存在且原資料無姓名', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.phone = accountNoName.account;
			bb.code = noNameCode.code;

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			const err = new CustomError(domainErr.ERR_ACCOUNT_EXISTS);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
	});
	describe('Success', () => {
		test('[success]]', async () => {
			const bb = CustomUtils.deepClone(defBody);

			const res = await agentClient
				.post(_ENDPOINT)
				.send(bb);

			expect(res.status).toBe(200);
			const acc = await accountRepo.findOneByAccount(bb.phone) as AccountEntity;
			expect(acc).toBeTruthy();
			expect(CustomValidator.nonEmptyString(acc.lineId)).toBe(true);
		});
	});
});
