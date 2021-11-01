import { injectable, inject, named } from 'inversify';
import {
	LOGGER,
	CustomHttpOption,
	commonInjectorCodes,
	ICustomHttpClient,
	CustomValidator,
	defConf,
	CustomError,
	TNullable,
} from '@demo/app-common';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { ILunaRepository } from '../../domain/repositories/i-luna-repository';
import { IAccountExistResponse, ILoginLunaUser, ILunaLoginResult } from '../types/luna-api-types';

@injectable()
export class LunaRepository implements ILunaRepository {
	private _httpClient: ICustomHttpClient;

	constructor(
		@inject(commonInjectorCodes.I_HTTP_CLIENT) @named(InjectorCodes.LUNA_HTTP_CLIENT) httpClient: ICustomHttpClient
	) {
		this._httpClient = httpClient;
	}

	login = async (account: string, password: string, requestOptions: CustomHttpOption): Promise<TNullable<ILoginLunaUser>> => {
		if (!CustomValidator.nonEmptyString(account) || !CustomValidator.nonEmptyString(password)) {
			return undefined;
		}
		requestOptions
			.setUrl(`${defConf.LUNA_WEB.ROOT}/${defConf.LUNA_WEB.ACCOUNT}`)
			.addHeader('x-request-from', 'web')
			.addParameter('account', account)
			.addParameter('pasword', password);

		const apiResult = await this._httpClient.tryPostJson(requestOptions);
		if (!apiResult.isOK()) {
			LOGGER.warn(apiResult.message);
			return undefined;
		}
		try {
			const msg = JSON.parse(apiResult.result) as ILunaLoginResult;
			if (!msg.success) {
				LOGGER.error(`Not logged in ${apiResult.result}`);
				return undefined;
			}
			return msg.data as ILoginLunaUser;

		} catch (ex) {
			const err = CustomError.fromInstance(ex);
			LOGGER.error(`Call luna fail ${err.stack}`);
			return undefined;
		}
	}

	accountExist = async (account: string, requestOptions: CustomHttpOption): Promise<boolean> => {
		if (!CustomValidator.nonEmptyString(account)) {
			return false;
		}
		requestOptions
			.setUrl(`${defConf.LUNA_WEB.ROOT}/${defConf.LUNA_WEB.ACCOUNT}`)
			.addHeader('x-request-from', 'web')
			.addParameter('account', account)
			.addParameter('checkAccount', true);

		const apiResult = await this._httpClient.tryPostJson(requestOptions);
		if (!apiResult.isOK()) {
			LOGGER.warn(apiResult.message);
			return false;
		}

		try {
			const msg = JSON.parse(apiResult.result) as IAccountExistResponse;
			return msg.data.accountExists;

		} catch (ex) {
			const err = CustomError.fromInstance(ex);
			LOGGER.error(`Call luna fail ${err.stack}`);
			return false;
		}
	}

}