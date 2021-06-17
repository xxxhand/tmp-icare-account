import { ErrorCodes } from '../src/custom-codes/error-codes';
import { CustomError } from '../src/custom-models/custom-error';
import { ICodeObject } from '../src/custom-types';

describe('Custom error test', () => {
	test('Should be exception', (done) => {
		const c = new CustomError(ErrorCodes.ERR_EXCEPTION);
		expect(c.code).toBe(99999);
		expect(c.httpStatus).toBe(500);
		expect(c.message).toBe('Ops! Exception');
		expect(c.isSuccess()).toBe(false);
		expect(c.isException()).toBe(true);
		done();
	});
	test('Should merge success', (done) => {
		const c: ICodeObject = {
			code: 10001,
			httpStatus: 400,
			message: 'Bad request',
			alias: 'ERR_BAD_REQ',
		};
		const arr: Array<ICodeObject> = [c];
		CustomError.mergeCodes(arr);
		const m = new CustomError(c.alias);
		expect(m.code).toBe(c.code);
		expect(m.httpStatus).toBe(c.httpStatus);
		expect(m.message).toBe(c.message);
		expect(m.type).toBe(c.alias);
		expect(m.isSuccess()).toBe(false);
		expect(m.isException()).toBe(false);
		done();
	});
	test('Should fail w/ an empty array', (done) => {
		const arr: Array<ICodeObject> = [];
		expect(() => CustomError.mergeCodes(arr)).toThrowError(new Error('Cannot merge with an empty array'));
		done();
	});
});
