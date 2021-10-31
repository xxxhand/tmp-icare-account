import { Response, NextFunction, Router } from 'express';
import { injectable } from 'inversify';
import * as util from 'util';
import {
	CustomResult,
	defaultContainer,
	lazyInject,
	TNullable,
	CustomUtils,
	LOGGER,
	CustomValidator,
	validateStrategy,
	ISMSClient,
	commonInjectorCodes,
	CustomError,
	CustomClassBuilder,
} from '@demo/app-common';
import { handleExpressAsync, ICustomExpressRequest } from '../application-types';
import { ErrorCodes as domainErr } from '../../domain/enums/error-codes';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { ICodeRepository } from '../../domain/repositories/i-code-repository';
import { AccountEntity } from '../../domain/entities/account-entity';
import { IAccountRepository } from '../../domain/repositories/i-account-repository';
import { LineIORegisterRequest } from '../../domain/value-objects/line-io-register-request';

export class LineIOAccountController {

	@lazyInject(InjectorCodes.I_CODE_REPO)
	private _codeRepo: TNullable<ICodeRepository>;
	@lazyInject(InjectorCodes.I_ACCOUNT_REPO)
	private _accountRepo: TNullable<IAccountRepository>;

	public create = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
		const mReq = CustomClassBuilder.build(LineIORegisterRequest, req.body)?.checkRequired();
		LOGGER.info(`Find account ${mReq?.phone} and verify code ${mReq?.code}`);
		const oCode = await this._codeRepo?.findOneByPhoneAndCode(<string>mReq?.phone, <string>mReq?.code);
		if (!oCode || oCode.hasExpired()) {
			throw new CustomError(domainErr.ERR_CODE_WRONG);
		}
		let oAccount = await this._accountRepo?.findOneByAccount(<string>mReq?.phone);
		if (oAccount) {
			LOGGER.info(`Account ${oAccount.account} duplicated`);
			throw new CustomError(domainErr.ERR_ACCOUNT_EXISTS);
		}

		oAccount = new AccountEntity();
		oAccount.account = <string>mReq?.phone;
		oAccount.name = <string>mReq?.name;
		oAccount.nickname = <string>mReq?.name;
		oAccount.salt = CustomUtils.generateRandomString(9);
		oAccount.password = CustomUtils.hashPassword(<string>mReq?.password, oAccount.salt);
		oAccount.lineId = <string>mReq?.lineId;
		await this._accountRepo?.save(oAccount);

		res.locals['result'] = new CustomResult();
		await next();
	}

	public update = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {

	}

	public login = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {

	}

	public static build(): Router {
		const _ctrl = new LineIOAccountController();
		const r = Router();
		r.route('/accounts')
			.post(handleExpressAsync(_ctrl.create));
		r.route('/accounts/:phone')
			.patch(handleExpressAsync(_ctrl.update));
		r.route('/login')
			.post(handleExpressAsync(_ctrl.login));
		return r;
	}
}