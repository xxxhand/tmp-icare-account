import { CustomLineClient } from '../src/custom-tools/custom-line-client';

describe.skip('Line test', () => {
	test('Should push message', async () => {
		const client = new CustomLineClient({
			channelAccessToken: 'XK2t0IGDupGgjxdxwom/GAyVzvXqfo5hZMN2nyJ99tgr26oF9jDmbuYgjk2RrfXOlG8SIxVVlOMSoFSWf3YQF8s4J6kvnsncO5FimIHUXuDquxYe37je/CKZL0461CVjSiq4Eokf4HNUJA0GXs38AwdB04t89/1O/w1cDnyilFU=',
			channelSecret: 'f9e01a93b0f5327b8a24fb3fc5ff919d',
		}, ['aabc']);

		const res = await client.pushTextToUsers(['U3c743f0cb5dcbd0c4da72cf732579aa3'], 'I am test');
		expect(res).toBe(true);
	});
});
