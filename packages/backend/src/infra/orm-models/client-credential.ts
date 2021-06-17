import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';

export const clientCredentialModelName = ModelCodes.CLINET_CREDENTIAL;

interface IDocumentModel {
  clientId: string,
  clientSecret: string,
  callbackUrl: string,
  name: string,
};

export interface IClientCredentialDocument extends IDocumentModel, Document { };

export const clientCredentialSchema = new Schema({
	clientId: {
		type: String,
		trim: true,
		required: true,
	},
	clientSecret: {
		type: String,
		trim: true,
		required: true,
	},
	callbackUrl: {
		type: String,
		trim: true,
		required: true,
	},
	name: {
		type: String,
		trim: true,
		required: true,
	},
}, {
	versionKey: false,
	timestamps: true,
	collection: `${clientCredentialModelName}s`,
});

clientCredentialSchema.index({ clientId: 1 }, { unique: true });

