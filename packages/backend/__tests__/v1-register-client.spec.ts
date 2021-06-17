import * as superTest from 'supertest';
import { CustomError, CustomUtils, defaultContainer, IMongooseClient, commonInjectorCodes } from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { ErrorCodes } from '../src/domain/enums/error-codes';
import { IClientRepository } from '../src/domain/repositories/i-client-repository';

const _ENDPOINT = '/api/v1/client-auth';

describe('Register credential spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let clientRepo: IClientRepository;
	let db: IMongooseClient;
	const defaultBody = {
		name: 'iLearning',
		callbackUrl: 'https://xxx.ccc.com',
	};
	beforeAll(async (done) => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		clientRepo = defaultContainer.get<IClientRepository>(InjectorCodes.I_CLIENT_REPO);

		done();
	});
	afterAll(async (done) => {
		await db.clearData();
		await db.close();
		done();
	});
	describe('Required fileds', () => {
		test('[2001] Parameter "name" is empty', async (done) => {
			const b = CustomUtils.deepClone(defaultBody);
			b.name = '';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			const err = new CustomError(ErrorCodes.CLIENT_NAME_INVALID);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
			done();
		});
		test('[2004] Parameter "callbackUrl" is empty', async (done) => {
			const b = CustomUtils.deepClone(defaultBody);
			b.callbackUrl = '';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			const err = new CustomError(ErrorCodes.CLIENT_CALLBACK_INVALID);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
			done();
		});
		test('[2004] Parameter "callbackUrl" is invalid', async (done) => {
			const b = CustomUtils.deepClone(defaultBody);
			b.callbackUrl = 'mqtt://sss.com';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			const err = new CustomError(ErrorCodes.CLIENT_CALLBACK_INVALID);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
			done();
		});
	});
	describe('Success', () => {
		test('[success]', async (done) => {
			const res = await agentClient
				.post(_ENDPOINT)
				.send(defaultBody);

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('result');
			expect(res.body.result).toEqual({
				clientId: expect.any(String),
				clientSecret: expect.any(String),
				callbackUrl: defaultBody.callbackUrl,
				name: defaultBody.name,
			});
			const c = await clientRepo.findOne(res.body.result.clientId);
			expect(c).toBeTruthy();
			expect(c?.name).toBe(defaultBody.name);
			expect(c?.callbackUrl).toBe(defaultBody.callbackUrl);
			done();
		});
	});
});
