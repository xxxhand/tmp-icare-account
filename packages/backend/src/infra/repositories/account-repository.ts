import { injectable, inject, named } from 'inversify';
import {
	LOGGER,
	commonInjectorCodes,
	ICustomHttpClient,
	TNullable,
	defConf,
	CustomUtils,
	CustomHttpOption,
} from '@demo/app-common';
import { IAccountRepository } from '../../domain/repositories/i-account-repository';
import { AccountEntity } from '../../domain/entities/account-entity';

@injectable()
export class AccountRepository implements IAccountRepository {
	private _httpClient: ICustomHttpClient;
	private _data: Array<AccountEntity> = [];

	constructor(
		@inject(commonInjectorCodes.I_HTTP_CLIENT) httpClient: ICustomHttpClient
	) {
		this._httpClient = httpClient;
	}

	save = async (account: TNullable<AccountEntity>): Promise<TNullable<AccountEntity>> => {
		if (!account) {
			return undefined;
		}
		account.id = CustomUtils.generateRandomString(10);
		this._data.push(account);
		return account;
	}
	checkExist = async (account: string): Promise<boolean> => {
		try {
			const opt = new CustomHttpOption(
				.setUrl(`${defConf.LUNA_WEB.ROOT}/${defConf.LUNA_WEB.ACCOUNT}`)
				.adß
		} catch (ex) {
			LOGGER.error('Call Luna api fail');
			LOGGER.error(ex.stack);
		}
	}

}