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
import { AccountCheckResult } from '../../domain/value-objects/account-check-result';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { ILunaRepository } from '../../domain/repositories/i-luna-repository';
import { IAccountRepository } from '../../domain/repositories/i-account-repository';

@injectable()
export class AccountController {

  @lazyInject(InjectorCodes.I_LUNA_REPO)
  private _lunaRepo: TNullable<ILunaRepository>;
  @lazyInject(InjectorCodes.I_ACCOUNT_REPO)
  private _accountRepo: TNullable<IAccountRepository>;
  private _twnMobileFormat = /^09\d{8}$/;

  public check = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  	const { account } = req.body;
  	new CustomValidator()
  		.checkThrows(account,
  			{ m: ErrorCodes.ERR_MUST_BE_MOBILE, s: validateStrategy.NON_EMPTY_STRING },
  			{ m: ErrorCodes.ERR_MUST_BE_MOBILE, fn: (val) => this._twnMobileFormat.test(val) }
  		);
    
  	const result = new AccountCheckResult();
    
  	const opt = new CustomHttpOption()
  		.addHeader('user-agent', req.headers['user-agent']);

  	LOGGER.info(`Find account ${account} from Luna`);
  	let existAccount = await this._lunaRepo?.accountExist(account, opt);
  	if (existAccount) {
  		result.exist();
  		res.locals['result'] = new CustomResult().withResult(result);
  		return next();
  	}
  	LOGGER.info(`Find account ${account} from icare`);
  	existAccount = await this._accountRepo?.checkExist(account);
  	if (existAccount) {
  		result.exist();
  		res.locals['result'] = new CustomResult().withResult(result);
  		return next();
  	}

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