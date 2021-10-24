import { injectable, inject, named } from 'inversify';
import {
	LOGGER,
	TNullable,
	CustomError,
	ErrorCodes as cmmErr,
	IMongooseClient,
	commonInjectorCodes,
	CustomValidator,
} from '@demo/app-common';
import { ModelCodes } from '../../domain/enums/model-codes';
import { ChatRoomEntity } from '../../domain/entities/chat-room-entity';
import { IChatRoomDocument } from '../../infra/orm-models';
import { IChatRoomRepository } from '../../domain/repositories/i-chat-room-repository';

@injectable()
export class ChatRoomRepository implements IChatRoomRepository {
	private _defaultClient: IMongooseClient;

	constructor(
		@inject(commonInjectorCodes.I_MONGOOSE_CLIENT) @named(commonInjectorCodes.DEFAULT_MONGO_CLIENT) defaultClient: IMongooseClient
	) {
		this._defaultClient = defaultClient;
	}
	save = async (entity: TNullable<ChatRoomEntity>): Promise<TNullable<ChatRoomEntity>> => {
		if (!entity) {
			return undefined;
		}
		try {
			const col = this._defaultClient.getModel<IChatRoomDocument>(ModelCodes.CHAT_ROOM);
			let obj = <IChatRoomDocument>{
				hostId: entity.hostId,
				openedAt: entity.openedAt,
				closedAt: entity.closedAt,
				status: entity.status,
			};
			obj = await col.create(obj);
			entity.chatRoomId = obj._id;
			return entity;
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}
	}
	findOne = async (roomId: string): Promise<TNullable<ChatRoomEntity>> => {
		if (!CustomValidator.nonEmptyString(roomId)) {
			return undefined;
		}
		try {
			const col = this._defaultClient.getModel<IChatRoomDocument>(ModelCodes.CHAT_ROOM);
			const q = {
				_id: roomId,
			};
			const doc: IChatRoomDocument = await col.findOne(q).lean();
			return this._transform(doc);
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}
	}

	private _transform = (doc: TNullable<IChatRoomDocument>): TNullable<ChatRoomEntity> => {
		if (!doc) {
			return undefined;
		}
		const e = new ChatRoomEntity();
		e.chatRoomId = doc._id;
		e.hostId = doc.hostId;
		e.closedAt = doc.closedAt;
		e.openedAt = doc.openedAt;
		e.status = doc.status;
		return e;
	}

}
