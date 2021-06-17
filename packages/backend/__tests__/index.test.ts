import { CustomValidator } from '@demo/app-common';

describe('Index test', () => {
	test('Should throw error', (done) => {
		expect(() => CustomValidator.nonEmptyString('', 'is test')).toThrow('is test');
		done();
	});
});
