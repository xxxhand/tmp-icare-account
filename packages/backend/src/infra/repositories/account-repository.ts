import { injectable, inject, named } from 'inversify';
import {
	LOGGER,
	commonInjectorCodes,
	TNullable,
	CustomValidator,
	IMongooseClient,
	CustomError,
	ErrorCodes as cmmErr,
	CustomClassBuilder,
} from '@demo/app-common';
import { ModelCodes } from '../../domain/enums/model-codes';
import { IAccountRepository } from '../../domain/repositories/i-account-repository';
import { AccountEntity } from '../../domain/entities/account-entity';
import { IAccountDocument } from '../../infra/orm-models/account';

@injectable()
export class AccountRepository implements IAccountRepository {
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
		try {
			const col = this._defaultClient.getModel<IAccountDocument>(ModelCodes.ACCOUNT);
			let obj = <IAccountDocument>{
				account: account.account,
				isLuna: account.isLuna,
				valid: account.valid,
			};
			obj = await col.create(obj);

			account.id = obj._id.toString();
			return account;
		} catch (ex) {
			LOGGER.error(`DB operations fail, ${ex.stack}`);
			throw new CustomError(cmmErr.ERR_EXEC_DB_FAIL);
		}

	}
	checkExist = async (account: string): Promise<boolean> => {
		if (!CustomValidator.nonEmptyString(account)) {
			return true;
		}
		try {
			const col = this._defaultClient.getModel<IAccountDocument>(ModelCodes.ACCOUNT);
			const q = {
				account,
				valid: true,
			};
			const cnt = await col.countDocuments(q);
			return cnt > 0;
		} catch (ex) {
			LOGGER.error(`DB operations fail, ${ex.stack}`);
			throw new CustomError(cmmErr.ERR_EXEC_DB_FAIL);
		}
	}

	private _transtorm = (doc: TNullable<IAccountDocument>): TNullable<AccountEntity> => {
		if (!doc) {
			return undefined;
		}
		const o = CustomClassBuilder.build(AccountEntity, doc) as AccountEntity;
		o.id = doc._id;
		return o;
	}

}