import { injectable, inject, named } from 'inversify';
import {
	TNullable,
	ErrorCodes as cmmErr,
	CustomError,
	IMongooseClient,
	commonInjectorCodes,
	CustomValidator,
	LOGGER,
} from '@demo/app-common';
import { ModelCodes } from '../../domain/enums/model-codes';
import { CodeEntity } from '../../domain/entities/code-entity';
import { ICodeRepository } from '../../domain/repositories/i-code-repository';
import { IVerificationDocument } from '../orm-models/verification';


@injectable()
export class CodeRepository implements ICodeRepository {

	private _defaultClient: IMongooseClient;

	constructor(
		@inject(commonInjectorCodes.I_MONGOOSE_CLIENT) @named(commonInjectorCodes.DEFAULT_MONGO_CLIENT) defaultClient: IMongooseClient
	) {
		this._defaultClient = defaultClient;
	}

	findOneByPhone = async (phone: string): Promise<TNullable<CodeEntity>> => {
		if (!CustomValidator.nonEmptyString(phone)) {
			return undefined;
		}
		try {
			const col = this._defaultClient.getModel<IVerificationDocument>(ModelCodes.VERIFICATION);
			const q = {
				mobile: phone,
			};
			const doc: IVerificationDocument = await col.findOne(q).lean();
			return this._transform(doc);
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}
	}
	save = async (entity: CodeEntity): Promise<TNullable<CodeEntity>> => {
		if (!entity) {
			return undefined;
		}
		const col = this._defaultClient.getModel<IVerificationDocument>(ModelCodes.VERIFICATION);
		if (!CustomValidator.nonEmptyString(entity.id)) {
			let obj = <IVerificationDocument>{
				mobile: entity.phone,
				verifyCode: entity.code,
				verifyCodeDeadline: new Date(entity.expiresAt),
			};
			try {
				obj = await col.create(obj);
				entity.id = obj._id.toString();
				return entity;
			} catch (ex) {
				const err = CustomError.fromInstance(ex)
					.useError(cmmErr.ERR_EXEC_DB_FAIL);

				LOGGER.error(`DB operations fail, ${err.stack}`);
				throw err;
			}
		}
		const upd = <IVerificationDocument>{
			verifyCode: entity.code,
			verifyCodeDeadline: new Date(entity.expiresAt),
			verifyComplete: entity.completed,
			verifyCodeCreateTime: new Date(entity.refreshAt),
		};
		try {
			await col.updateOne({ _id: entity.id }, { '$set': upd });
			return entity;
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}
	}

	private _transform = (doc: TNullable<IVerificationDocument>): TNullable<CodeEntity> => {
		if (!doc) {
			return undefined;
		}
		const e = new CodeEntity();
		e.id = doc._id.toString();
		e.phone = doc.mobile;
		e.code = doc.verifyCode;
		e.expiresAt = new Date(doc.verifyCodeDeadline).getTime();
		e.refreshAt = new Date(doc.verifyCodeCreateTime).getTime();
		return e;
	}

}