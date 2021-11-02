import { Request, Response, NextFunction, Router } from 'express';
import {
	CustomResult,
	lazyInject,
	TNullable,
	CustomUtils,
	LOGGER,
	CustomError,
	CustomClassBuilder,
	CustomHttpOption,
} from '@demo/app-common';
import { handleExpressAsync } from '../application-types';
import { ErrorCodes as domainErr } from '../../domain/enums/error-codes';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { ICodeRepository } from '../../domain/repositories/i-code-repository';
import { AccountEntity } from '../../domain/entities/account-entity';
import { IAccountRepository } from '../../domain/repositories/i-account-repository';
import { ILunaRepository } from '../../domain/repositories/i-luna-repository';
import { LineIORegisterRequest } from '../../domain/value-objects/line-io-register-request';
import { LineIOUpdateAccountRequest } from '../../domain/value-objects/line-io-update-account-request';
import { LineIOLoginRequest } from '../../domain/value-objects/line-io-login-request';
import { ILunaLoginData } from '../../infra/types/luna-api-types';

export class LineIOAccountController {

	@lazyInject(InjectorCodes.I_CODE_REPO)
	private _codeRepo: TNullable<ICodeRepository>;
	@lazyInject(InjectorCodes.I_ACCOUNT_REPO)
	private _accountRepo: TNullable<IAccountRepository>;
	@lazyInject(InjectorCodes.I_LUNA_REPO)
	private _lunaRepo: TNullable<ILunaRepository>;

	public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

	public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

	public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const mReq = CustomClassBuilder.build(LineIOLoginRequest, req.body)?.checkRequired();
		LOGGER.info(`Account ${mReq?.account} login...`);

		let inLuna = false;
		let accountStr = <string>mReq?.account;
		const opt = new CustomHttpOption()
			.addHeader('user-agent', req.headers['user-agent']);
		const oUser = await this._lunaRepo?.login(<string>mReq?.account, <string>mReq?.password, opt) as ILunaLoginData;
		if (oUser) {
			inLuna = true;
			accountStr = `luna_${mReq?.account}`;
		}
		LOGGER.info(`Find account from db using ${accountStr}`);
		let oAccount = await this._accountRepo?.findOneByAccount(accountStr) as AccountEntity;
		if (!inLuna && !oAccount) {
			LOGGER.info(`Account ${mReq?.account} not found..`);
			throw new CustomError(domainErr.ERR_ACCOUNT_PASS_WRONG);
		}

		// 若為Luna用戶，僅第一次登入需建立資料，第二次以後僅變更Line id
		if (inLuna && !oAccount) {
			oAccount = new AccountEntity();
			oAccount.account = accountStr;
			oAccount.isLuna = true;
			oAccount.name = oUser.user.name;
			oAccount.nickname = oUser.user.name;
			oAccount.phone = oUser.user.mobile;
			oAccount.salt = CustomUtils.generateRandomString(9);
			oAccount.password = CustomUtils.hashPassword(<string>mReq?.password, oAccount.salt);
		}

		if (!oAccount.passwordEqualsTo(CustomUtils.hashPassword(<string>mReq?.password, oAccount.salt))) {
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