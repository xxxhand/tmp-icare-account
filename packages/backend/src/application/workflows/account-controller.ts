import { Request, Response, NextFunction, Router } from 'express';
import { injectable } from 'inversify';
import {
	CustomClassBuilder,
	CustomResult,
	defaultContainer,
	lazyInject,
	TNullable,
	CustomUtils,
	LOGGER,
	ErrorCodes,
	CustomValidator,
	validateStrategy,
	CustomHttpOption,
} from '@demo/app-common';
import { handleExpressAsync } from '../application-types';
import { IAccountService } from '../services/interfaces/i-account-service';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { IAccountRepository } from '../../domain/repositories/i-account-repository';

@injectable()
export class AccountController {

	@lazyInject(InjectorCodes.I_ACCOUNT_REPO)
	private _accountRepo: TNullable<IAccountRepository>;
	@lazyInject(InjectorCodes.I_ACCOUNT_SRV)
	private _accountService: TNullable<IAccountService>;
	private _twnMobileFormat = /^09\d{8}$/;

	public check = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const { account } = req.body;
		new CustomValidator()
			.checkThrows(account,
				{ m: ErrorCodes.ERR_MUST_BE_MOBILE, s: validateStrategy.NON_EMPTY_STRING },
				{ m: ErrorCodes.ERR_MUST_BE_MOBILE, fn: (val) => this._twnMobileFormat.test(val) }
			);

		const opt = new CustomHttpOption()
			.addHeader('user-agent', req.headers['user-agent']);

		const result = await this._accountService?.checkAccountExist(account, opt);

		res.locals['result'] = new CustomResult().withResult(result);
		await next();
	}

	public static build(): Router {
		defaultContainer.bind(AccountController).toSelf().inSingletonScope();
		const ctrl = defaultContainer.get(AccountController);
		const accountRouter = Router();

		accountRouter.route('/account/check')
			.post(handleExpressAsync(ctrl.check));

		return accountRouter;
	}

}