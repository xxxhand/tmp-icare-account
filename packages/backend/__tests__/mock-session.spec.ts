import { SuperAgentTest, agent } from 'supertest';
import { App } from '../src/bootstrap/app';

const _ENDPOINT = '/mocks/session';

describe('Mock session test', () => {
	let agentClient: SuperAgentTest;
	const postedData = {
		account: 'xxxhand',
		name: 'hand',
		age: 20,
	};
	beforeAll(async (done) => {
		agentClient = agent(new App().app);
		done();
	});
	test('Session should be operated', async (done) => {
		let session = null;
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
