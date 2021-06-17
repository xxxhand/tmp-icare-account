import { injectable } from 'inversify';
import nodeFetch from 'node-fetch';
import { CustomResult, LOGGER, ErrorCodes as cmmErr, CustomError } from '..';
import { CustomHttpOption } from '../custom-models/custom-http-option';
import { ICustomHttpClient, TNullable } from '../custom-types';

@injectable()
export class CustomHttpClient implements ICustomHttpClient {
  tryPostJson = async (option: TNullable<CustomHttpOption>): Promise<CustomResult> => {
  	if (!option) {
  		throw new Error('Option is null..');
  	}
  	const opts = <Record<string, any>>{
  		method: 'POST',
  		headers: {
  			'content-type': 'application/json',
  		},
  		body: {},
  		timeout: option.timeout,
  	};
  	option.headers.forEach((val, key) => {
  		opts.headers[key] = val;
  	});
  	option.parameters.forEach((val, key) => {
  		opts.body[key] = val;
  	});
  	opts.body = JSON.stringify(opts.body);
  	try {
  		const res = await nodeFetch(option.uri, opts);

  		const result = new CustomResult()
  			.withCode(res.ok ? 0 : res.status);
  		result.message = await res.text() || '';
  		result.result = await res.json();

  		return result;
  	} catch (ex) {
  		const code = CustomError.getCode(cmmErr.ERR_EXEC_HTTP_ERROR);
  		return new CustomResult()
  			.withCode(code.code)
  			.withMessage(ex.message);
  	}
  }
  tryPostForm = async (option: TNullable<CustomHttpOption>): Promise<CustomResult> => {
  	throw new Error('Method not implemented.');
  }
  tryGet = async (option: TNullable<CustomHttpOption>): Promise<CustomResult> => {
  	if (!option) {
  		throw new Error('Option is null..');
  	}
  	const endpoint = new URL(option.uri);
  	option.parameters.forEach((v, k) => endpoint.searchParams.append(k, v));
  	const opts = <Record<string, any>>{
  		method: 'GET',
  		headers: {
  			'content-type': 'application/json',
  		},
  		timeout: option.timeout,
  	};
  	option.headers.forEach((val, key) => {
  		opts.headers[key] = val;
  	});
  	LOGGER.info(`Fetch ${endpoint}`);
  	try {
  		const res = await nodeFetch(endpoint, opts);

  		const result = new CustomResult()
  			.withCode(res.ok ? 0 : res.status);
  		result.message = await res.text() || '';
  		result.result = await res.json();

  		return result;
  	} catch (ex) {
  		const code = CustomError.getCode(cmmErr.ERR_EXEC_HTTP_ERROR);
  		return new CustomResult()
  			.withCode(code.code)
  			.withMessage(ex.message);
  	}
  }
}
