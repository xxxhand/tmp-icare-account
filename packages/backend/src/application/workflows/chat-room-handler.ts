import { Socket } from 'socket.io';
import { injectable } from 'inversify';
import {
	LOGGER,
	CustomClassBuilder,
	CustomResult,
	lazyInject,
	TNullable,
	CustomError,
	CustomValidator,
	ErrorCodes as cmmErr,
} from '@demo/app-common';
import { RoomEvents } from '../../domain/enums/room-event-codes';
import { ErrorCodes } from '../../domain/enums/error-codes';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { JoinRoomRequest } from '../../domain/value-objects/join-room-request';
import { IChatRoomRepository } from '../../domain/repositories/i-chat-room-repository';
import { ITokenRepository } from '../../domain/repositories/i-token-repository';
import { IClientRepository } from '../../domain/repositories/i-client-repository';
import { AbstractSocketHandler } from './abstract-socket-handler';

@injectable()
export class ChatRoomHandler extends AbstractSocketHandler {

	@lazyInject(InjectorCodes.I_CHAT_ROOM_REPO)
	private _roomRepo: TNullable<IChatRoomRepository>;
	@lazyInject(InjectorCodes.I_CLIENT_REPO)
	private _clietRepo: TNullable<IClientRepository>;
	@lazyInject(InjectorCodes.I_TOKEN_REPO)
	private _tokenRepo: TNullable<ITokenRepository>;

	constructor() {
		super('chat-room');
	}
	public onAuthorize = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
		try {
			const { id, token } = socket.handshake.query;
			LOGGER.info(`Check authrization of ${id}`);
			if (!CustomValidator.nonEmptyString(<string>id)) {
				throw new CustomError(cmmErr.ERR_UN_AUTH);
			}
			LOGGER.info(`Check token ${token}`);
			const oToken = await this._tokenRepo?.findOne(<string>token);
			if (!oToken) {
				LOGGER.info(`${token} not found`);
				throw new CustomError(cmmErr.ERR_UN_AUTH);
			}
			LOGGER.info(`Find client credential ${oToken.clientId}`);
			const oClient = await this._clietRepo?.findOne(oToken.clientId);
			if (!oClient) {
				LOGGER.info(`${token} not found`);
				throw new CustomError(cmmErr.ERR_UN_AUTH);
			}
			const acceptedIdentity = await this._clietRepo?.checkIdentity(<string>id, oClient);
			if (!acceptedIdentity) {
				LOGGER.info(`${id} validate identity fail`);
				throw new CustomError(cmmErr.ERR_UN_AUTH);
			}

			return next();
		} catch (ex) {
			return next(CustomError.fromInstance(ex));
		}
	}
	public onConnection = (socket: Socket): void => {
		LOGGER.info(`Client ${socket.id} connected to ${this.path}...`);
		socket
			.on(RoomEvents.JOIN_ROOM, async (msg: any): Promise<void> => {
				const res = new CustomResult();
				try {
					const mReq = <JoinRoomRequest>CustomClassBuilder.build(JoinRoomRequest, msg)?.checkRequired();
					LOGGER.info(`Find room ${mReq.chatRoomId}`);
					const oRoom = await this._roomRepo?.findOne(mReq.chatRoomId);
					if (!oRoom) {
						LOGGER.info(`Chat room ${mReq.chatRoomId} not found`);
						throw new CustomError(ErrorCodes.NOT_EXIST_CHAT_ROOM);
					}
					if (!oRoom.isOpened()) {
						LOGGER.info(`Chat room ${oRoom.chatRoomId} is not opened`);
						throw new CustomError(ErrorCodes.CHAT_ROOM_IS_CLOSE);
					}
					res.withResult(oRoom);
				} catch (ex) {
					res.withErrorCode(CustomError.getCode(CustomError.fromInstance(ex).type));
				}
				socket.emit(RoomEvents.JOIN_ROOM_RES, res);
			});
	}
}
