import * as superTest from 'supertest';
import * as util from 'util';
import { mock } from 'jest-mock-extended';
import {
	CustomError,
	defaultContainer,
	IMongooseClient,
	commonInjectorCodes,
	CustomUtils,
	ILineClient,
} from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { ErrorCodes as domainErr } from '../src/domain/enums/error-codes';
import { AccountEntity } from '../src/domain/entities/account-entity';
import { IAccountRepository } from '../src/domain/repositories/i-account-repository';

const _ENDPOINT = '/line_io/api/v1/accounts/%s';
interface IBody {
	name: string;
	password: string;
	lineId: string;
}

describe('Line io - update account spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let db: IMongooseClient;
	let accountRepo: IAccountRepository;
	let defAccount: AccountEntity;
	let defBody: IBody = {
		name: 'xxxhand',
		password: CustomUtils.makeSha256('nn0989HG'),
		lineId: CustomUtils.generateRandomString(16),
	};
	beforeAll(async () => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		accountRepo = defaultContainer.get(InjectorCodes.I_ACCOUNT_REPO);

		defAccount = new AccountEntity();
		defAccount.account = `09${CustomUtils.generateRandomNumbers(8)}`;
		defAccount.name = 'I am hand';
		defAccount.nickname = 'I am nickname';
		defAccount.salt = CustomUtils.generateRandomString(9);
		defAccount.password = CustomUtils.hashPassword('a123456b', defAccount.salt);
		defAccount.lineId = 'I_am_line_id';
		defAccount = await accountRepo.save(defAccount) as AccountEntity;

		//#region mock line client
		const line = mock<ILineClient>();
		line.linkRichMenuToUser
			.mockResolvedValue();
		line.pushTextToUsers
			.mockResolvedValue(true);

		defaultContainer
			.rebind<ILineClient>(commonInjectorCodes.I_LINE_CLIENT)
			.toConstantValue(line)
			.whenTargetNamed(commonInjectorCodes.DEFAULT_LINE_CLIENT);
		//#endregion		

	});
	afterAll(async () => {
		await db.clearData();
		await db.close();
	});
	describe('Required fields', () => { 
		test('[10002] ??????????????????', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.name = '';

			const endpoint = util.format(_ENDPOINT, defAccount.account);
			const res = await agentClient
				.patch(endpoint)
				.send(bb);

			const err = new CustomError(domainErr.ERR_NAME_EMPTY);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10003] ??????????????????(??????)', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.password = '';

			const endpoint = util.format(_ENDPOINT, defAccount.account);
			const res = await agentClient
				.patch(endpoint)
				.send(bb);

			const err = new CustomError(domainErr.ERR_PASS_WRONG_FORMAT);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
		test('[10005] Line id????????????', async () => {
			const bb = CustomUtils.deepClone(defBody);
			bb.lineId = '';

			const endpoint = util.format(_ENDPOINT, defAccount.account);
			const res = await agentClient
				.patch(endpoint)
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
		test('[10007] ???????????????', async () => {
			const endpoint = util.format(_ENDPOINT, '0987654322');
			const res = await agentClient
				.patch(endpoint)
				.send(defBody);

			const err = new CustomError(domainErr.ERR_ACCOUNT_NOT_EXIST);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
	});
	describe('Success', () => { 
		test('[success]', async () => {
			const endpoint = util.format(_ENDPOINT, defAccount.account);
			const res = await agentClient
				.patch(endpoint)
				.send(defBody);

			expect(res.status).toBe(200);
			const acc = await accountRepo.findOneByAccount(defAccount.account) as AccountEntity;
			expect(acc).toBeTruthy();
			expect(acc.name).toBe(defBody.name);
			expect(acc.nickname).toBe(defAccount.nickname);
			expect(acc.lineId).toBe(defBody.lineId);
		});
		test.todo('Switch line rich menu');
	});
});
