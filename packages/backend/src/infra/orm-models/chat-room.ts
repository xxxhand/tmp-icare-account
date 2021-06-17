import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';
import { RoomStatusCodes } from '../../domain/enums/room-status-codes';

export const chatRoomModelName = ModelCodes.CHAT_ROOM;

interface IDocumentModel {
  status: number,
  hostId: string,
  openedAt: Date,
  closedAt: Date,
};

export interface IChatRoomDocument extends IDocumentModel, Document { };

export const chatRoomSchema = new Schema({
	status: {
		type: Number,
		default: RoomStatusCodes.OPEN,
		enum: [RoomStatusCodes.OPEN, RoomStatusCodes.CLOSE, RoomStatusCodes.OFF],
	},
	hostId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	openedAt: {
		type: Date,
	},
	closedAt: {
		type: Date,
	},
}, {
	versionKey: false,
	timestamps: true,
	collection: `${chatRoomModelName}s`,
});
