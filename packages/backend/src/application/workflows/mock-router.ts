import { Request, Response, NextFunction, Router } from 'express';
import { CustomResult, LOGGER } from '@demo/app-common';
import { handleExpressAsync } from '../application-types';

export class MockRouter {
	public prefix: string = '/mocks';
	public router: Router = Router();

	constructor() {
		this._init();
	}

	private _init = (): void => {
		this.router.route('/session')
			.post(handleExpressAsync(this._addSession))
			.get(handleExpressAsync(this._getSession))
			.delete(handleExpressAsync(this._rmSession));
	}

	private _addSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		req.session.user = req.body;
		res.locals['result'] = new CustomResult();
		LOGGER.info(`post - ${req.session.id}`);
		LOGGER.info(`post - ${JSON.stringify(req.session.user)}`);
		await next();
	}

	private _getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		res.locals['result'] = new CustomResult().withResult(req.session.user);
		LOGGER.info(`get - ${req.session.id}`);
		await next();
	}

	private _rmSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		req.session.destroy(() => LOGGER.info('Remove mock session done'));
		res.locals['result'] = new CustomResult();
		await next();
	}
}
