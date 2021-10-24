import { injectable, inject, named } from 'inversify';
import {
	LOGGER,
	TNullable,
	CustomValidator,
	IMongooseClient,
	commonInjectorCodes,
	CustomClassBuilder,
	ErrorCodes as cmmErr,
	CustomError,
	ICustomHttpClient,
	CustomHttpOption,
	defaultContainer,
} from '@demo/app-common';
import { ClientEntity } from '../..//domain/entities/client-entity';
import { ModelCodes } from '../../domain/enums/model-codes';
import { IClientCredentialDocument } from '../../infra/orm-models';
import { IClientRepository } from '../../domain/repositories/i-client-repository';

@injectable()
export class ClientRepository implements IClientRepository {
	private _defaultClient: IMongooseClient;

	constructor(
		@inject(commonInjectorCodes.I_MONGOOSE_CLIENT) @named(commonInjectorCodes.DEFAULT_MONGO_CLIENT) defaultClient: IMongooseClient
	) {
		this._defaultClient = defaultClient;
	}
	checkIdentity = async (userId: string, entity: TNullable<ClientEntity>): Promise<boolean> => {
		if (!CustomValidator.nonEmptyString(userId) || !entity) {
			return false;
		}
		const httpClient = defaultContainer.get<ICustomHttpClient>(commonInjectorCodes.I_HTTP_CLIENT);
		const opt = new CustomHttpOption()
			.setUrl(entity.callbackUrl)
			.setTimeout(3)
			.addParameter('clientId', userId);

		LOGGER.info(`Call ${opt.uri} to validate identity`);
		const res = await httpClient.tryGet(opt);
		LOGGER.info(JSON.stringify(res));
		return res.isOK();
	}

	public findOne = async (clientId: string): Promise<TNullable<ClientEntity>> => {
		if (!CustomValidator.nonEmptyString(clientId)) {
			return undefined;
		}
		try {
			const col = this._defaultClient.getModel<IClientCredentialDocument>(ModelCodes.CLINET_CREDENTIAL);
			const q = {
				clientId,
			};
			const doc: IClientCredentialDocument = await col.findOne(q).lean();
			return this._transform(doc);
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}

	}
	public save = async (entity: TNullable<ClientEntity>): Promise<TNullable<ClientEntity>> => {
		if (!entity) {
			return undefined;
		}
		try {
			const col = this._defaultClient.getModel<IClientCredentialDocument>(ModelCodes.CLINET_CREDENTIAL);
			const obj = <IClientCredentialDocument>{
				clientId: entity.clientId,
				clientSecret: entity.clientSecret,
				name: entity.name,
				callbackUrl: entity.callbackUrl,
			};
			await col.create(obj);
			return entity;
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}
	}

	private _transform = (doc: TNullable<IClientCredentialDocument>): TNullable<ClientEntity> => {
		if (!doc) {
			return undefined;
		}
		return CustomClassBuilder.build(ClientEntity, doc);
	}
}