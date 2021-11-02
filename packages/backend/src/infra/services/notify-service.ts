import { injectable, inject, named } from 'inversify';
import {
	LOGGER,
	ISMSClient,
	commonInjectorCodes,
	CustomError,
	ILineClient,
} from '@demo/app-common';
import { INotifyservice } from './interfaces/i-notify-service';

@injectable()
export class NotifyService implements INotifyservice {
	private _smsClient: ISMSClient;
	private _lineClient: ILineClient;

	constructor(
		@inject(commonInjectorCodes.I_SMS_CLIENT) smsClient: ISMSClient,
		@inject(commonInjectorCodes.I_LINE_CLIENT) @named(commonInjectorCodes.DEFAULT_LINE_CLIENT) lineClient: ILineClient
	) {
		this._smsClient = smsClient;
		this._lineClient = lineClient;
	}

	sendSMS = async (phone: string, message: string): Promise<boolean> => {
		try {
			await this._smsClient?.tryConnect();
			return this._smsClient?.send(phone, message);
		} catch (ex) {
			const err = CustomError.fromInstance(ex);
			LOGGER.error(`Send SMS to ${phone} Fail ${err.stack}`);
			throw err;
		}
	}

	sendLineText = async (id: string, message: string): Promise<boolean> => {
		throw new Error('Method not implemented.');
	}

}