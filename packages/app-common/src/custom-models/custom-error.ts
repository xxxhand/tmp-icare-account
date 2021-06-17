import { ICodeObject } from '../custom-types';
import { ErrorCodes } from '../custom-codes/error-codes';
import { HttpCodes } from '../custom-codes/http-codes';

const _errorCodeFields = ['alias', 'code', 'httpStatus', 'message'];

function _validateCodeFormat(code: ICodeObject): boolean {
	if (!code) {
		return false;
	}
	const keys = Object.keys(code);
	if (keys.length < 4) {
		return false;
	}
	for (const k of keys) {
		if (!_errorCodeFields.includes(k)) {
			return false;
		}
	}
	return true;
}

const _codeMap = new Map<string, ICodeObject>()
	.set(ErrorCodes.SUCCESS, {
		alias: ErrorCodes.SUCCESS,
		code: 0,
		httpStatus: HttpCodes.OK,
		message: 'Success',
	})
	.set(ErrorCodes.ERR_EXEC_DB_FAIL, {
		alias: ErrorCodes.ERR_EXEC_DB_FAIL,
		code: 90001,
		httpStatus: HttpCodes.INTERNAL_ERROR,
		message: 'Database execution fail',
	})
	.set(ErrorCodes.ERR_JSON_FORMAT_FAIL, {
		alias: ErrorCodes.ERR_JSON_FORMAT_FAIL,
		code: 90002,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Invalid json format',
	})
	.set(ErrorCodes.ERR_DEPRECATED, {
		alias: ErrorCodes.ERR_DEPRECATED,
		code: 90003,
		httpStatus: HttpCodes.DEPRECATED,
		message: 'Depecated resources',
	})
	.set(ErrorCodes.ERR_NOT_IMPLEMENT, {
		alias: ErrorCodes.ERR_NOT_IMPLEMENT,
		code: 90004,
		httpStatus: HttpCodes.NOT_IMPLEMENT,
		message: 'Not implemented',
	})
	.set(ErrorCodes.ERR_UN_AUTH, {
		alias: ErrorCodes.ERR_UN_AUTH,
		code: 90005,
		httpStatus: HttpCodes.UN_AUTHORIZE,
		message: 'Unauthorized',
	})
	.set(ErrorCodes.ERR_EXEC_HTTP_ERROR, {
		alias: ErrorCodes.ERR_EXEC_HTTP_ERROR,
		code: 90006,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Bad request',
	})
	.set(ErrorCodes.ERR_EXCEPTION, {
		alias: ErrorCodes.ERR_EXCEPTION,
		code: 99999,
		httpStatus: HttpCodes.INTERNAL_ERROR,
		message: 'Ops! Exception',
	});

export class CustomError extends Error {
    public type: string;
    public code: number;
    public message: string;
    public name: string;
    public httpStatus: number;

    constructor(codeType: string, replaceString: string = '') {
    	super();
    	const err = CustomError.getCode(codeType);
    	this.type = err.code != 99999 ? codeType : ErrorCodes.ERR_EXCEPTION;
    	this.code = err.code;
    	this.message = replaceString || err.message;
    	this.name = this.constructor.name;
    	this.httpStatus = err.httpStatus;
    }

    public isSuccess(): boolean {
    	return Object.is(this.code, 0);
    }

    public isException(): boolean {
    	return Object.is(this.code, 99999);
    }

    public static mergeCodes(codes: Array<ICodeObject>): void {
    	if (!Array.isArray(codes) || codes.length === 0) {
    		throw new Error('Cannot merge with an empty array');
    	}
    	for (const c of codes) {
    		if (!_validateCodeFormat(c)) {
    			throw new Error('Illegal error code format');
    		}
    		if (_codeMap.has(c.alias)) {
    			throw new Error(`Duplicate key ${c.alias} was defined`);
    		}
    		_codeMap.set(c.alias, c);
    	}
    }

    public static getCode(codeType: string = ''): ICodeObject {
    	let err = _codeMap.get(codeType);
    	if (!err) {
    		err = {
    			alias: ErrorCodes.ERR_EXCEPTION,
    			code: 99999,
    			httpStatus: 500,
    			message: codeType || 'Ops! Exception', 
    		};
    	}
    	return err;
    }
}