import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';

export const accountModelName = ModelCodes.ACCOUNT;

interface IDocumentModel {
	account: string;
	valid: boolean;
	isLuna: boolean;
	name: string;
	nickname: string;
	password: string;
	salt: string;
	phone: string;
	lineId: string;
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
	// 密碼
	password: {
		type: String,
		required: true,
	},
	// 加密鹽
	salt: {
		type: String,
		required: true,
	},
	// 帳號啟用日
	activation: Date,
	// 驗證碼
	verifyCode: String,
	// 驗證碼期限
	verifyCodeCreateTime: Date,
	// 最近重設密碼日期
	recentResetPwdDate: Date,
	// 暱稱
	nickname: String,
	// 性別
	gender: {
		type: String,
		enum: ['0', '1'],
		default: '1',
	},
	// 電子信箱
	email: {
		type: String,
	},
	// 使用者圖片
	photo: String,
	// 地址
	address: String,
	// 真實姓名
	name: String,
	// 身份證
	personalId: String,
	// 課程學習身份別
	eLearnIdentityType: String,
	// 電話
	phone: String,
	// 出生年月日
	birthday: Date,
	// Line Id
	lineId: {
		type: String,
		default: '',
	},
}, {
	versionKey: false,
	timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime' },
	collection: accountModelName,
});