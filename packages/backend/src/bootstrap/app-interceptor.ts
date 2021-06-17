import * as fs from 'fs-extra';
import { Request, Response, NextFunction } from 'express';
import { LOGGER, HttpCodes, CustomError, CustomResult, getTraceId, CustomValidator } from '@demo/app-common';
import { ICustomExpressRequest } from '../application/application-types';

export class AppInterceptor {

	/** Before starting request handler */
	static async beforeHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
		LOGGER.info('-----------------------------------------------------------');
		LOGGER.info(`${req.method} ${req.path} - start`);
		await next();
	}

	/** Complete request */
	static async completeHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
		const r = res.locals['result'] as CustomResult;
		if (!r) {
			return next();
		}
		LOGGER.info(`${req.method} ${req.originalUrl} - 200`);
		r.traceId = getTraceId();
		res.status(HttpCodes.OK).json(r);
	}

	/** Error handler */
	static async errorHandler(ex: any, req: Request, res: Response, next: NextFunction): Promise<any> {
		let error: CustomError = ex;
		if (!(ex instanceof CustomError)) {
			LOGGER.error(ex.stack);
			error = new CustomError('', ex.message);
		}
		const result = new CustomResult()
			.withTraceId(getTraceId())
			.withCode(error.code)
			.withMessage(error.message);

		res.status(error.httpStatus).json(result);

		const str = `${req.method} ${req.originalUrl} - ${error.httpStatus} [${error.type}] ${error.message}`;
		if (error?.isException()) {
			LOGGER.error(str);
		} else {
			LOGGER.warn(str);
		}

		const cReq = <ICustomExpressRequest>req;
		const tasks: Array<any> = [];
		if (cReq.file) {
			tasks.push(fs.unlink(cReq.file.path));
		}
		if (cReq.files) {
			const files = Object.keys(cReq.files);
			files.forEach((x) => {
				const ary = cReq.files[x];
				if (CustomValidator.nonEmptyArray(ary)) {
					ary.forEach((f) => tasks.push(fs.unlink(f.path)));
				}
			});
		}
		if (CustomValidator.nonEmptyArray(tasks)) {
			Promise.all(tasks).catch((ex) => LOGGER.error(ex.stack));
		}

	}

	/** Path not found handler */
	static async notFoundHandler(req: Request, res: Response): Promise<any> {
		const str = `${req.method} ${req.originalUrl} - 404 Path not found`;
		LOGGER.info(str);
		res.status(HttpCodes.NOT_FOUND).send(str);
	}
}