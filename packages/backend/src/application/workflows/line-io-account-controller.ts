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
import { LineIOUpdateAccountRequest } from '../../domain/value-objects/line-io-update-account-request';
import { LineIOLoginRequest } from '../../domain/value-objects/line-io-login-request';

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
		oAccount.phone = <string>mReq?.phone;
		await this._accountRepo?.save(oAccount);

		oCode.complete();
		await this._codeRepo?.save(oCode);

		res.locals['result'] = new CustomResult();
		await next();
	}

	public update = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
		const mReq = CustomClassBuilder.build(LineIOUpdateAccountRequest, req.body);
		mReq?.usePhone(req.params.phone).checkRequired();
		LOGGER.info(`Find account ${mReq?.phone}`);
		const oAccount = await this._accountRepo?.findOneByAccount(<string>mReq?.phone);
		if (!oAccount) {
			LOGGER.info(`Account ${mReq?.phone} not found`);
			throw new CustomError(domainErr.ERR_ACCOUNT_NOT_EXIST);
		}
		oAccount.name = <string>mReq?.name;
		oAccount.salt = CustomUtils.generateRandomString(9);
		oAccount.password = CustomUtils.hashPassword(<string>mReq?.password, oAccount.salt);
		oAccount.lineId = <string>mReq?.lineId;
		await this._accountRepo?.save(oAccount);

		res.locals['result'] = new CustomResult();
		await next();
	}

	public login = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
		const mReq = CustomClassBuilder.build(LineIOLoginRequest, req.body)?.checkRequired();
		LOGGER.info(`Account ${mReq?.account} login...`);
		// TODO: Login luna

		const oAccount = await this._accountRepo?.findOneByAccount(<string>mReq?.account);
		if (!oAccount) {
			LOGGER.info(`Account ${mReq?.account} not found in iLearn..`);
			throw new CustomError(domainErr.ERR_ACCOUNT_PASS_WRONG);
		}

		oAccount.lineId = <string>mReq?.lineId;
		await this._accountRepo?.save(oAccount);

		res.locals['result'] = new CustomResult();
		await next();
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