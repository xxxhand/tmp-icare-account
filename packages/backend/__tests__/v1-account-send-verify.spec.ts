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
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { ErrorCodes as domainErr } from '../src/domain/enums/error-codes';
import { AccountEntity } from '../src/domain/entities/account-entity';
import { IAccountRepository } from '../src/domain/repositories/i-account-repository';

const _ENDPOINT = '/api/account/sendVerify';
interface IBody {
	mobile: string;
};

describe('Send verify spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let db: IMongooseClient;
	let accountRepo: IAccountRepository;
	let oAccount: AccountEntity;
	const defBody: IBody = {
		mobile: '0987654321',
	};

	beforeAll(async () => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		accountRepo = defaultContainer.get(InjectorCodes.I_ACCOUNT_REPO);

		oAccount = new AccountEntity();
		oAccount.account = defBody.mobile;
		oAccount.name = 'oAccount';
		oAccount.salt = CustomUtils.generateRandomString(9);
		oAccount.password = CustomUtils.hashPassword('a123456b', oAccount.salt);
		oAccount = await accountRepo.save(oAccount) as AccountEntity;

		// rebind mock http client - start
		const nonExist = new CustomResult()
			.withResult({
				success: true,
				data: {
					accountExists: false,
				},
			});

		const existResult = new CustomResult()
			.withResult({
				success: true,
				data: {
					accountExists: true,
				},
			});

		const http = mock<ICustomHttpClient>();
		http.tryPostJson
			.mockResolvedValueOnce(existResult)
			.mockResolvedValueOnce(nonExist);
		defaultContainer.rebind<ICustomHttpClient>(commonInjectorCodes.I_HTTP_CLIENT).toConstantValue(http);
		// rebind mock http client - end

	});
	afterAll(async () => {
		await db.clearData();
		await db.close();
	});
	describe('Required fields', () => {
		test('[90003] Parameter "mobile" is empty', async () => {
			const b = CustomUtils.deepClone(defBody);
			b.mobile = '';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			const err = new CustomError(ErrorCodes.ERR_MUST_BE_MOBILE);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[90003] Parameter "mobile" is not mobile format', async () => {
			const b = CustomUtils.deepClone(defBody);
			b.mobile = '1111111111';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			const err = new CustomError(ErrorCodes.ERR_MUST_BE_MOBILE);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
	});
	describe('Validation rules', () => {
		let existDBAccount: AccountEntity;
		beforeAll(async () => {
			existDBAccount = new AccountEntity();
			existDBAccount.account = '0987678678';
			existDBAccount.name = 'existDBAccount';
			existDBAccount.salt = CustomUtils.generateRandomString(9);
			existDBAccount.password = CustomUtils.hashPassword('a123456b', existDBAccount.salt);
			existDBAccount = await accountRepo.save(existDBAccount) as AccountEntity;
		});
		test('[10004] Account registered(in Luna)', async () => {
			const b = CustomUtils.deepClone(defBody);
			b.mobile = '0988765456';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			const err = new CustomError(domainErr.ERR_ACCOUNT_EXISTS);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10004] Account registered(in DB)', async () => {
			const b = CustomUtils.deepClone(defBody);
			b.mobile = existDBAccount.account;
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

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
		test.todo('[success]');
	});
});
