import * as superTest from 'supertest';
import { defaultContainer, IMongooseClient, commonInjectorCodes } from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';

const _ENDPOINT = '/mocks/session';

describe('Mock session test', () => {
	let agentClient: superTest.SuperAgentTest;
	let db: IMongooseClient;
	const postedData = {
		account: 'xxxhand',
		name: 'hand',
		age: 20,
	};
	beforeAll(async (done) => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		done();
	});
	afterAll(async (done) => {
		await db.clearData();
		await db.close();
		done();
	});
	test('Session should be operated', async (done) => {
		let res = await agentClient
			.post(_ENDPOINT)
			.send(postedData);

		res = await agentClient
			.get(_ENDPOINT);

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			traceId: expect.any(String),
			code: 0,
			message: '',
			result: postedData,
		});

		await agentClient
			.delete(_ENDPOINT);

		res = await agentClient
			.get(_ENDPOINT);

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			traceId: expect.any(String),
			code: 0,
			message: '',
		});

		done();
	});
});
