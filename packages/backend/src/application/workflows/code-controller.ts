import { Response, NextFunction, Router } from 'express';
import { injectable } from 'inversify';
import * as util from 'util';
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
	ISMSClient,
	commonInjectorCodes,
	CustomError,
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
	@lazyInject(commonInjectorCodes.I_SMS_CLIENT)
	private _smsClient: TNullable<ISMSClient>;

	private _twnMobileFormat = /^09\d{8}$/;
	private _smsTemplate = '這是驗證碼%s';

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

		try {
			await this._smsClient?.tryConnect();
			const isSended = await this._smsClient?.send(oCode.phone, util.format(this._smsTemplate, oCode.code));
			LOGGER.info(`Send SMS to ${phone} result ${isSended}`);
		} catch (ex) {
			const err = CustomError.fromInstance(ex);
			LOGGER.error(`Send SMS to ${phone} Fail ${err.stack}`);
			throw err;
		}


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