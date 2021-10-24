import { injectable, inject, named } from 'inversify';
import {
	LOGGER,
	TNullable,
	CustomError,
	ErrorCodes as cmmErr,
	IMongooseClient,
	commonInjectorCodes,
	CustomValidator,
	CustomClassBuilder,
} from '@demo/app-common';
import { ModelCodes } from '../../domain/enums/model-codes';
import { TokenEntity } from '../../domain/entities/token-entity';
import { ITokenDocument } from '../../infra/orm-models';
import { ITokenRepository } from '../../domain/repositories/i-token-repository';

@injectable()
export class TokenRepository implements ITokenRepository {
	private _defaultClient: IMongooseClient;

	constructor(
		@inject(commonInjectorCodes.I_MONGOOSE_CLIENT) @named(commonInjectorCodes.DEFAULT_MONGO_CLIENT) defaultClient: IMongooseClient
	) {
		this._defaultClient = defaultClient;
	}
	save = async (entity: TNullable<TokenEntity>): Promise<TNullable<TokenEntity>> => {
		if (!entity) {
			return undefined;
		}
		try {
			const col = this._defaultClient.getModel<ITokenDocument>(ModelCodes.TOKEN);
			let obj = <ITokenDocument>{
				token: entity.token,
				expiredAt: entity.expiredAt,
				clientId: entity.clientId,
			};
			obj = await col.create(obj);
			return entity;
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}
	}
	findOne = async (token: string): Promise<TNullable<TokenEntity>> => {
		if (!CustomValidator.nonEmptyString(token)) {
			return undefined;
		}
		try {
			const col = this._defaultClient.getModel<ITokenDocument>(ModelCodes.TOKEN);
			const q = {
				token,
			};
			const doc: ITokenDocument = await col.findOne(q).lean();
			return this._transform(doc);
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}
	}

	private _transform = (doc: TNullable<ITokenDocument>): TNullable<TokenEntity> => {
		if (!doc) {
			return undefined;
		}
		return CustomClassBuilder.build(TokenEntity, doc);
	}
}
