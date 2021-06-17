import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';

export const tokenModelName = ModelCodes.TOKEN;

interface IDocumentModel {
  clientId: string,
  token: string,
  expiredAt: number,
};

export interface ITokenDocument extends IDocumentModel, Document { };

export const tokenSchema = new Schema({
	token: {
		type: String,
		trim: true,
		required: true,
	},
	clientId: {
		type: String,
		trim: true,
		required: true,
	},
	expiredAt: {
		type: Number,
	},
}, {
	versionKey: false,
	timestamps: true,
	collection: `${tokenModelName}s`,
});

tokenSchema.index({ token: 1 }, { unique: true });

