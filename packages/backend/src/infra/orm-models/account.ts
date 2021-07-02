import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';

export const accountModelName = ModelCodes.ACCOUNT;

interface IDocumentModel {
  account: string,
  valid: boolean,
  isLuna: boolean,
};

export interface IAccountDocument extends IDocumentModel, Document { };

export const accountSchema = new Schema({
	account: {
		type: String,
		trim: true,
		lowercase: true,
		required: true,
	},
	isLuna: {
		type: Boolean,
		default: false,
	},
	valid: {
		type: Boolean,
		default: true,
	},
}, {
	versionKey: false,
	timestamps: true,
	collection: accountModelName,
});