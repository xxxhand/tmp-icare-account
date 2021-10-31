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

	findOneByAccount = async (account: string): Promise<TNullable<AccountEntity>> => {
		try {
			const col = this._defaultClient.getModel<IAccountDocument>(ModelCodes.ACCOUNT);
			const q = {
				account,
			};
			const doc: IAccountDocument = await col.findOne(q).lean();
			return this._transform(doc);
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}
	}

	save = async (account: TNullable<AccountEntity>): Promise<TNullable<AccountEntity>> => {
		if (!account) {
			return undefined;
		}
		const col = this._defaultClient.getModel<IAccountDocument>(ModelCodes.ACCOUNT);
		if (!CustomValidator.nonEmptyString(account.id)) {
			let obj = <IAccountDocument>{
				account: account.account,
				isLuna: account.isLuna,
				valid: account.valid,
				name: account.name,
				nickname: account.nickname,
				password: account.password,
				salt: account.salt,
				phone: account.phone,
				lineId: account.lineId,
			};
			try {
				obj = await col.create(obj);
				account.id = obj._id.toString();
				return account;
			} catch (ex) {
				const err = CustomError.fromInstance(ex)
					.useError(cmmErr.ERR_EXEC_DB_FAIL);

				LOGGER.error(`DB operations fail, ${err.stack}`);
				throw err;
			}
		}

		const upd = <IAccountDocument>{
			name: account.name,
			nickname: account.nickname,
			password: account.password,
			salt: account.salt,
			phone: account.phone,
			lineId: account.lineId,
		};

		await col.updateOne({ _id: account.id }, { '$set': upd });
		return account;
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
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}
	}

	private _transform = (doc: TNullable<IAccountDocument>): TNullable<AccountEntity> => {
		if (!doc) {
			return undefined;
		}
		const o = CustomClassBuilder.build(AccountEntity, doc) as AccountEntity;
		o.id = doc._id;
		return o;
	}

}