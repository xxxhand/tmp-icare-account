import { Response, NextFunction, Router } from 'express';
import { injectable } from 'inversify';
import {
	CustomClassBuilder,
	CustomResult,
	defaultContainer,
	lazyInject,
	TNullable,
	CustomUtils,
	LOGGER,
	CustomValidator,
	validateStrategy,
} from '@demo/app-common';
import { handleExpressAsync, ICustomExpressRequest } from '../application-types';
import { ErrorCodes as domainErr } from '../../domain/enums/error-codes';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { ICodeRepository } from '../../domain/repositories/i-code-repository';
import { CodeEntity } from '../../domain/entities/code-entity';

@injectable()
export class CodeController {

  @lazyInject(InjectorCodes.I_CODE_REPO)
  private _codeRepo: TNullable<ICodeRepository>;
  private _twnMobileFormat = /^09\d{8}$/;

  public sendCode = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
  	const { phone } = req.params;
  	LOGGER.info(`Request to send SMS to ${phone}`);
  	new CustomValidator()
  		.checkThrows(phone,
  			{ s: validateStrategy.NON_EMPTY_STRING, m: domainErr.ERR_PHONE_FORMAT_WRONG },
  			{ m: domainErr.ERR_PHONE_FORMAT_WRONG, fn: (val) => this._twnMobileFormat.test(val) }
  		);
  	LOGGER.info(`Find exist code by ${phone}`);
  	let oCode = await this._codeRepo?.findOneByPhone(phone);
  	if (!oCode) {
  		oCode = new CodeEntity();
  		oCode.phone = phone;
  	}
  	oCode.refesh(CustomUtils.generateRandomNumbers(4));
  	await this._codeRepo?.save(oCode);
    
  	res.locals['result'] = new CustomResult();
  	await next();
  }

  public static build(): Router {
  	defaultContainer.bind(CodeController).toSelf().inSingletonScope();
  	const _ctrl = defaultContainer.get(CodeController);
  	const r = Router();
  	r.route('/codes/:phone')
  		.put(handleExpressAsync(_ctrl.sendCode));

  	return r;
  }
}