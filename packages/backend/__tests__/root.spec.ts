import { SuperAgentTest, agent } from 'supertest';
import { App } from '../src/bootstrap/app';

describe('Index test', () => {
	let agentClient: SuperAgentTest;
	beforeAll(async (done) => {
		agentClient = agent(new App().app);
		done();
	});
	test('Should be hello world', async (done) => {
		const res = await agentClient
			.get('/api/v1');

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			traceId: expect.any(String),
			code: 0,
			message: '',
			result: 'Hello world',
		});

		done();
	});
});
