import { smsOptions } from '../src/custom-types';
import { CustomSMSClient } from '../src/custom-tools/custom-sms-client';
import { CustomUtils } from '../src/custom-tools/custom-utils';


describe.skip('SMS client test', () => {
	const opt: smsOptions = {
		host: '202.39.54.130',
		port: 8000,
		account: '89809080',
		password: '740e2d0a',
		maxTryLimit: 2,
	};
	test('Should be connected and be logged in', async () => {
		const client = new CustomSMSClient(opt);
		await client.tryConnect();
		expect(client.isConnected()).toBe(true);
		expect(client.isLogged()).toBe(true);

		await client.close();
		expect(client.isConnected()).toBe(false);
		expect(client.isLogged()).toBe(false);
	});
	test.todo('Should send SMS success');
});
