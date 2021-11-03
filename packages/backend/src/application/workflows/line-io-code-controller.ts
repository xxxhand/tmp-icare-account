import { Request, Response, NextFunction, Router } from 'express';
import * as util from 'util';
import {
	CustomResult,
	lazyInject,
	TNullable,
	CustomUtils,
	LOGGER,
	CustomValidator,
	validateStrategy,
} from '@demo/app-common';
import { handleExpressAsync } from '../application-types';
import { ErrorCodes as domainErr } from '../../domain/enums/error-codes';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { ICodeRepository } from '../../domain/repositories/i-code-repository';
import { CodeEntity } from '../../domain/entities/code-entity';
import { INotifyservice } from '../../infra/services/interfaces/i-notify-service';

export class LineIOCodeController {

	@lazyInject(InjectorCodes.I_CODE_REPO)
	private _codeRepo: TNullable<ICodeRepository>;
	@lazyInject(InjectorCodes.I_NOFIFY_SRV)
	private _notifyService: TNullable<INotifyservice>;

	private _twnMobileFormat = /^09\d{8}$/;
	private _smsTemplate = '這是驗證碼%s';

	public sendCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

		await this._notifyService?.sendSMS(oCode.phone, util.format(this._smsTemplate, oCode.code));

		res.locals['result'] = new CustomResult();
		await next();
	}

	public static build(): Router {
		const _ctrl = new LineIOCodeController();
		const r = Router();
		r.route('/codes/:phone')
			.put(handleExpressAsync(_ctrl.sendCode));

		return r;
	}
}