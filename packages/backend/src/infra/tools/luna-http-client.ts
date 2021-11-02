import { injectable } from 'inversify';
import nodeFetch from 'node-fetch';
import {
	CustomHttpClient,
	CustomHttpOption,
	TNullable,
	CustomResult,
	CustomError,
	ErrorCodes as cmmErr,
} from '@demo/app-common';

@injectable()
export class LunaHttpClient extends CustomHttpClient {
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
			const m = await res.text();
			if (!result.isOK()) {
				result.message = m;
			} else {
				result.result = m;
			}
			return result;
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_HTTP_ERROR);
			return new CustomResult()
				.withCode(err.code)
				.withMessage(err.message);
		}
	}
}

