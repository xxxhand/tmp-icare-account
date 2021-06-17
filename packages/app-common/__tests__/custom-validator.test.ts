import { CustomValidator, validateStrategy } from '../src/custom-tools/custom-validator';

describe('custom validator test', () => {
	test('[Empty string]', (done) => {
		expect(() => new CustomValidator().nonEmptyStringThrows('')).toThrowError('Empty string');
		expect(() => new CustomValidator().nonEmptyStringThrows('', 'input an empty string')).toThrowError('input an empty string');
		expect(new CustomValidator().nonEmptyStringThrows('I am not empty')).toBeInstanceOf(CustomValidator);
		done();
	});
	test('[Empty array] Should throw an error', (done) => {
		expect(() => new CustomValidator().checkThrows([],
			{ m: 'Empty array', s: validateStrategy.NON_EMPTY_ARRAY }
		)).toThrowError('Empty array');
		expect(new CustomValidator().checkThrows(['aaa'],
			{ m: 'Empty array', s: validateStrategy.NON_EMPTY_ARRAY }
		)).toBeInstanceOf(CustomValidator);
		done();
	});
	test('[Not an email] Should throw an error', (done) => {
		expect(() => new CustomValidator().checkThrows('sss',
			{ m: 'Not an email', s: validateStrategy.IS_EMAIL }
		)).toThrowError('Not an email');
		expect(new CustomValidator().checkThrows('aaa@gmail.com',
			{ m: 'Not an email', s: validateStrategy.IS_EMAIL }
		)).toBeInstanceOf(CustomValidator);
		done();
	});
	test('[Multi rules w/ fn] Should throw an error', (done) => {
		expect(() => new CustomValidator().checkThrows('sss',
			{ m: 'invalid string', fn: (val: string) => val.includes('a') }
		)).toThrowError('invalid string');
		expect(new CustomValidator().checkThrows('aaa@gmail.com',
			{ m: 'invalid string', fn: (val: string) => val.includes('gmail') }
		)).toBeInstanceOf(CustomValidator);
		done();
	});
	test('[static method] empty string', (done) => {
		expect(CustomValidator.nonEmptyString('')).toBe(false);
		expect(() => CustomValidator.nonEmptyString('', 'Empty string')).toThrowError('Empty string');
		done();
	});
	test('[static method] empty array', (done) => {
		expect(CustomValidator.nonEmptyArray([])).toBe(false);
		expect(() => CustomValidator.nonEmptyArray([], 'Empty array')).toThrowError('Empty array');
		done();
	});
	test('[static method] object equals', (done) => {
		let a: any = {
			a: 'a',
		};
		let b: any = {
			b: 'b',
		};
		expect(CustomValidator.isEqual(a, b)).toBe(false);
		a.b = 'b';
		b.a = 'a';
		expect(CustomValidator.isEqual(a, b)).toBe(true);
		const aa = {
			aa: 'aa',
			bb: {
				cc: 'cc',
			},
			dd: [1, 2, 3],
		};
		const bb = {
			aa: 'aa',
			bb: {
				cc: 'cc',
			},
			dd: [1, 2, 3],
		};
		expect(CustomValidator.isEqual(aa, bb)).toBe(true);
		expect(CustomValidator.isEqual(1, 1)).toBe(true);
		expect(CustomValidator.isEqual('1', '1')).toBe(true);
		expect(CustomValidator.isEqual('1', 1)).toBe(true);
		expect(() => CustomValidator.isEqual('k', 'j', 'Not match')).toThrowError('Not match');
		done();
	});
});
