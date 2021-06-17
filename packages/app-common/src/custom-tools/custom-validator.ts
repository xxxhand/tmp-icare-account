import validator from 'validator';
import deepEqual from 'deep-equal';
import { CustomError } from '../custom-models/custom-error';

type validateFunc = (val: any) => boolean;

const _nonEmptyString: validateFunc = (val: string): boolean => {
	if (!val || typeof val !== 'string') {
		return false;
	}
	return !validator.isEmpty(val);
};

const _nonEmptyArray: validateFunc = (val: Array<any>): boolean => {
	return val &&
		Array.isArray(val) &&
		val.length > 0;
};

const _isNumber: validateFunc = (val: any): boolean => {
	return typeof val === 'number';
};


export enum validateStrategy {
	NON_EMPTY_STRING = 'isNonEmptyString',
	NON_EMPTY_ARRAY = 'isNonEmptyArray',
	IS_EMAIL = 'isEmail',
	IS_NUMBER = 'isNumber',
}

const _validateFuncs = new Map<string, validateFunc>()
	.set(validateStrategy.NON_EMPTY_STRING, _nonEmptyString)
	.set(validateStrategy.IS_EMAIL, validator.isEmail)
	.set(validateStrategy.IS_NUMBER, _isNumber)
	.set(validateStrategy.NON_EMPTY_ARRAY, _nonEmptyArray);

export interface IValidateRule {
	s?: validateStrategy;
	m: string;
	fn?: validateFunc;
}

export class CustomValidator {

	public checkThrows(val: any, ...rules: IValidateRule[]): this {
		for (const rule of rules) {
			if (rule.fn && typeof rule.fn === 'function') {
				const result = rule.fn(val);
				if (!result) {
					throw new CustomError(rule.m);
				}
				continue;
			}
			if (rule.s) {
				const s = _validateFuncs.get(rule.s);
				if (!s) {
					throw new CustomError('', `${rule.s} checker is not defined`);
				}
				const result = s(val);
				if (!result) {
					throw new CustomError(rule.m);
				}
				continue;
			}
			throw new CustomError('Either one of s or fn must defined');
		}
		return this;
	}

	public nonEmptyStringThrows(val: string, message?: string): CustomValidator {
		if (!_nonEmptyString(val)) {
			throw new CustomError(message || 'Empty string');
		}
		return this;
	}

	public isNumberThrows(val: number, message?: string): this {
		if (!_isNumber(val)) {
			throw new CustomError(message || 'Not a number');
		}
		return this;
	}

	public static nonEmptyString(val?: string, message?: string): boolean {
		const res = _nonEmptyString(val);
		if (!res && _nonEmptyString(message)) {
			throw new CustomError(message || 'Empty string');
		}
		return res;
	}

	public static nonEmptyArray(val: Array<any>, message?: string): boolean {
		const res = _nonEmptyArray(val);
		if (!res && _nonEmptyString(message)) {
			throw new CustomError(message || 'Empty array');
		}
		return res;
	}

	public static isNumber(val: number, message?: string): boolean {
		const res = _isNumber(val);
		if (!res && _nonEmptyString(message)) {
			throw new CustomError(message || 'Not a number');
		}
		return res;
	}

	public static isEqual(val1: any, val2: any, message?: string): boolean {
		const res = deepEqual(val1, val2);
		if (!res && _nonEmptyString(message)) {
			throw new CustomError(message || 'Not match');
		}
		return res;
	}
}