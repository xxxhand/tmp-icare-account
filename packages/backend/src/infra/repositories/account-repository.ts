import { injectable, inject, named } from 'inversify';
import {
	LOGGER,
	commonInjectorCodes,
	TNullable,
	CustomUtils,
	CustomValidator,
	IMongooseClient,
} from '@demo/app-common';
import { IAccountRepository } from '../../domain/repositories/i-account-repository';
import { AccountEntity } from '../../domain/entities/account-entity';

@injectable()
export class AccountRepository implements IAccountRepository {
	private _data: Array<AccountEntity> = [];
	private _defaultClient: IMongooseClient;

	constructor(
		@inject(commonInjectorCodes.I_MONGOOSE_CLIENT) @named(commonInjectorCodes.DEFAULT_MONGO_CLIENT) defaultClient: IMongooseClient
	) {
		this._defaultClient = defaultClient;
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
		if (!CustomValidator.nonEmptyString(account)) {
			return true;
		}
		const ary = this._data.filter((x) => x.account === account);
		return ary.length > 0;
	}

}