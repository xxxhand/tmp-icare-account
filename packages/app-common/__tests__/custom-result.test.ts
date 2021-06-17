import { ICodeObject } from '../src/custom-types';
import { CustomResult } from '../src/custom-models/custom-result';

describe('Custom result rest', () => {
	test('Should be ok w/ an object result', (done) => {
		class TestObj {
      public test: string = 'ok';
      public isTest(): boolean {
      	return this.test === 'ok';
      }
		}

		const obj = new TestObj();
		const res = new CustomResult<TestObj>()
			.withResult(obj);
		expect(res.isOK()).toBe(true);
		expect(res.code).toBe(0);
		expect(res.message).toBe('');
		expect(res.result).toBeInstanceOf(TestObj);
		expect(res.result?.isTest()).toBe(true);
		done();
	});
	test('Should not be ok w/ code and message', (done) => {
		const err: ICodeObject = {
			alias: 'ERR_UNKNOWN',
			code: 10001,
			message: 'Unknown message',
			httpStatus: 400,
		};
		const res = new CustomResult()
			.withCode(err.code)
			.withMessage(err.message);
		expect(res.isOK()).toBe(false);
		expect(res.code).toBe(err.code);
		expect(res.message).toBe(err.message);
		expect(res.result).toBeUndefined();
		done();
	});
});
