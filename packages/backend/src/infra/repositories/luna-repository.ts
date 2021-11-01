import { injectable, inject, named } from 'inversify';
import {
	LOGGER,
	CustomHttpOption,
	commonInjectorCodes,
	ICustomHttpClient,
	CustomValidator,
	defConf,
	CustomError,
} from '@demo/app-common';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { ILunaRepository } from '../../domain/repositories/i-luna-repository';
import { IAccountExistResponse } from '../types/luna-api-types';

@injectable()
export class LunaRepository implements ILunaRepository {
	private _httpClient: ICustomHttpClient;

	constructor(
		@inject(commonInjectorCodes.I_HTTP_CLIENT) @named(InjectorCodes.LUNA_HTTP_CLIENT) httpClient: ICustomHttpClient
	) {
		this._httpClient = httpClient;
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