import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';

export const verificationModelName = ModelCodes.VERIFICATION;

interface IDocumentModel {
  mobile: string,
  verifyCode: string,
  verifyCodeDeadline: Date,
  verifyCodeCreateTime: Date,
  verifyComplete: boolean
};

export interface IVerificationDocument extends IDocumentModel, Document { };

export const verificationSchema = new Schema({
	mobile: {
		type: String,
		trim: true,
		required: true,
	},
	verifyCode: {
		type: String,
		trim: true,
		required: true,
	},
	verifyCodeDeadline: {
		type: Date,
		default: new Date(),
	},
	verifyComplete: {
		type: Boolean,
		default: false,
	},
	verifyCodeCreateTime: {
		type: Date,
		default: new Date(),
	},
}, {
	versionKey: false,
	timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime' },
	collection: verificationModelName,
});

verificationSchema.index({ mobile: 1 },{ unique: true });
