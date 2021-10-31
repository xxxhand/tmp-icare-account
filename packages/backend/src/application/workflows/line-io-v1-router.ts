import { Router } from 'express';
import { LineIOCodeController } from './line-io-code-controller';
import { LineIOAccountController } from './line-io-account-controller';

export class LineIOV1Router {
	public prefix: string = '/line_io/api/v1';
	public router: Router = Router();

	constructor() {
		this._init();
	}

	private _init = (): void => {
		this.router
			.use(LineIOAccountController.build())
			.use(LineIOCodeController.build());
	}
}
