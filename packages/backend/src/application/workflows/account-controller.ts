import { Request, Response, NextFunction, Router } from 'express';
import { injectable } from 'inversify';
import {
	CustomResult,
	defaultContainer,
	lazyInject,
	TNullable,
	LOGGER,
	CustomHttpOption,
	CustomError,
} from '@demo/app-common';
import { handleExpressAsync } from '../application-types';
import { IAccountService } from '../services/interfaces/i-account-service';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { ErrorCodes as domainErr } from '../../domain/enums/error-codes';
import { IAccountRepository } from '../../domain/repositories/i-account-repository';

@injectable()
export class AccountController {

	@lazyInject(InjectorCodes.I_ACCOUNT_REPO)
	private _accountRepo: TNullable<IAccountRepository>;
	@lazyInject(InjectorCodes.I_ACCOUNT_SRV)
	private _accountService: TNullable<IAccountService>;

	public check = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const opt = new CustomHttpOption()
			.addHeader('user-agent', req.headers['user-agent']);

		const result = await this._accountService?.checkAccountExist(req.body.account, opt);

		res.locals['result'] = new CustomResult().withResult(result);
		await next();
	}

	public sendVerify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const { mobile } = req.body;
		const opt = new CustomHttpOption()
			.addHeader('user-agent', req.headers['user-agent']);

		const result = await this._accountService?.checkAccountExist(mobile, opt);
		if (!result?.isValid()) {
			throw new CustomError(domainErr.ERR_ACCOUNT_EXISTS);
		}

		res.locals['result'] = new CustomResult().withResult();
		await next();
	}

	public static build(): Router {
		defaultContainer.bind(AccountController).toSelf().inSingletonScope();
		const ctrl = defaultContainer.get(AccountController);
		const accountRouter = Router();

		accountRouter.route('/account/check')
			.post(handleExpressAsync(ctrl.check));
		accountRouter.route('/account/sendVerify')
			.post(handleExpressAsync(ctrl.sendVerify));

		return accountRouter;
	}

}