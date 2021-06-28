import * as superTest from 'supertest';
import {
	CustomError,
	CustomUtils,
	defaultContainer,
	IMongooseClient,
	commonInjectorCodes,
	ErrorCodes,
	HttpCodes,
	ICustomHttpClient,
} from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { MockLunaAccountNotExist } from '../__mocks__/mock-luna-account-not-exist';
import { MockLunaAccountExist } from '../__mocks__/mock-luna-account-exist';

const _ENDPOINT = '/api/account/check';
interface IBody {
	account: string;
};

describe('Account check spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let db: IMongooseClient;
	const defBody: IBody = {
		account: '0987654321',
	};

	beforeAll(async () => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
	});
	afterAll(async () => {
		await db.clearData();
		await db.close();
	});
	describe('Required fileds', () => {
		test('[90003] Parameter "account" is empty', async () => {
			const b = CustomUtils.deepClone(defBody);
			b.account = '';
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
		test('[90003] Parameter "account" is not mobile format', async () => {
			const b = CustomUtils.deepClone(defBody);
			b.account = '1111111111';
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
		test('[Account does not exist]', async () => {
			// rebind http client
			defaultContainer.rebind<ICustomHttpClient>(commonInjectorCodes.I_HTTP_CLIENT).to(MockLunaAccountNotExist);
			const b = CustomUtils.deepClone(defBody);
			b.account = '0956655655';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			expect(res.status).toBe(HttpCodes.OK);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: 0,
				message: '',
				result: {
					valid: true,
					exists: false,
				},
			});
		});
	});
	describe('Success', () => {
		test('[Account exist in Luna]', async () => {
			// rebind http client
			defaultContainer.rebind<ICustomHttpClient>(commonInjectorCodes.I_HTTP_CLIENT).to(MockLunaAccountExist);
			const b = CustomUtils.deepClone(defBody);
			b.account = '0956655657';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			expect(res.status).toBe(HttpCodes.OK);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: 0,
				message: '',
				result: {
					valid: false,
					exists: true,
				},
			});
		});
		test('[Account exist in db]', async () => {
			// rebind http client
			defaultContainer.rebind<ICustomHttpClient>(commonInjectorCodes.I_HTTP_CLIENT).to(MockLunaAccountNotExist);
			const res = await agentClient
				.post(_ENDPOINT)
				.send(defBody);

			expect(res.status).toBe(HttpCodes.OK);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: 0,
				message: '',
				result: {
					valid: false,
					exists: true,
				},
			});
		});
	});
});
