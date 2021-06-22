import { Request, Response, NextFunction, Router } from 'express';
import { CustomResult } from '@demo/app-common';
import { ClientAuthController } from './client-auth-controller';

export class V1Router {
	public prefix: string = '/api/v1';
	public router: Router = Router();

	constructor() {
		this._init();
	}

	private _init = (): void => {
		this.router
			.all('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
				res.locals['result'] = new CustomResult<string>().withResult('Hello world');
				await next();
			});
		this.router
			.use(ClientAuthController.build());
	}
}
