import { CustomError, ICodeObject, HttpCodes } from '@demo/app-common';

export enum ErrorCodes {
	//#region Sample only
	CHAT_ROOM_ID_INVALID = 'CHAT_ROOM_ID_INVALID',
	CLIENT_USER_ID_INVALID = 'CLIENT_USER_ID_INVALID',
	CLIENT_USER_NAME_INVALID = 'CLIENT_USER_NAME_INVALID',
	CLIENT_NAME_INVALID = 'CLIENT_NAME_INVALID',
	CLIENT_CALLBACK_INVALID = 'CLIENT_CALLBACK_INVALID',
	NOT_EXIST_CHAT_ROOM = 'NOT_EXIST_CHAT_ROOM',
	CHAT_ROOM_IS_CLOSE = 'CHAT_ROOM_IS_CLOSE',
	//#endregion
	ERR_PHONE_FORMAT_WRONG = 'ERR_PHONE_FORMAT_WRONG',
	ERR_NAME_EMPTY = 'ERR_NAME_EMPTY',
	ERR_PASS_WRONG_FORMAT = 'ERR_PASS_WRONG_FORMAT',
	ERR_CODE_WRONG = 'ERR_CODE_WRONG',
	ERR_LINE_ID_EMPTY = 'ERR_LINE_ID_EMPTY',
	ERR_ACCOUNT_EXISTS = 'ERR_ACCOUNT_EXISTS',
	ERR_ACCOUNT_NOT_EXIST = 'ERR_ACCOUNT_NOT_EXIST',
	ERR_ACCOUNT_EMPTY = 'ERR_ACCOUNT_EMPTY',
	ERR_ACCOUNT_PASS_WRONG = 'ERR_ACCOUNT_PASS_WRONG',
};

const _codes: Array<ICodeObject> = [
	//#region Sample only
	{
		alias: ErrorCodes.NOT_EXIST_CHAT_ROOM,
		httpStatus: HttpCodes.BAD_REQ,
		message: '聊天室不存在',
		code: 1001,
	},
	{
		alias: ErrorCodes.CHAT_ROOM_ID_INVALID,
		httpStatus: HttpCodes.BAD_REQ,
		message: '無效聊天室代碼',
		code: 1002,
	},
	{
		alias: ErrorCodes.CLIENT_USER_ID_INVALID,
		httpStatus: HttpCodes.BAD_REQ,
		message: '無效使用者代碼',
		code: 1003,
	},
	{
		alias: ErrorCodes.CLIENT_USER_NAME_INVALID,
		httpStatus: HttpCodes.BAD_REQ,
		message: '無效使用者名稱',
		code: 1004,
	},
	{
		alias: ErrorCodes.CHAT_ROOM_IS_CLOSE,
		httpStatus: HttpCodes.BAD_REQ,
		message: '關閉房間狀態無法加入',
		code: 1011,
	},
	{
		alias: ErrorCodes.CLIENT_NAME_INVALID,
		httpStatus: HttpCodes.BAD_REQ,
		message: '無效客戶名稱',
		code: 2001,
	},
	{
		alias: ErrorCodes.CLIENT_CALLBACK_INVALID,
		httpStatus: HttpCodes.BAD_REQ,
		message: '無效客戶回調網址',
		code: 2004,
	},
	//#endregion
	{
		alias: ErrorCodes.ERR_PHONE_FORMAT_WRONG,
		code: 10001,
		httpStatus: 400,
		message: '電話格式錯誤',
	},
	{
		alias: ErrorCodes.ERR_NAME_EMPTY,
		code: 10002,
		httpStatus: 400,
		message: '姓名不得為空',
	},
	{
		alias: ErrorCodes.ERR_PASS_WRONG_FORMAT,
		code: 10003,
		httpStatus: 400,
		message: '密碼格式錯誤',
	},
	{
		alias: ErrorCodes.ERR_CODE_WRONG,
		code: 10004,
		httpStatus: 400,
		message: '驗證碼錯誤',
	},
	{
		alias: ErrorCodes.ERR_LINE_ID_EMPTY,
		code: 10005,
		httpStatus: 400,
		message: 'Line id不得為空',
	},
	{
		alias: ErrorCodes.ERR_ACCOUNT_EXISTS,
		code: 10006,
		httpStatus: 400,
		message: '帳號已被註冊',
	},
	{
		alias: ErrorCodes.ERR_ACCOUNT_NOT_EXIST,
		code: 10007,
		httpStatus: 400,
		message: '帳號不存在',
	},
	{
		alias: ErrorCodes.ERR_ACCOUNT_EMPTY,
		code: 10008,
		httpStatus: 400,
		message: '帳號為空',
	},
	{
		alias: ErrorCodes.ERR_ACCOUNT_PASS_WRONG,
		code: 10009,
		httpStatus: 400,
		message: '帳號或密碼錯誤',
	}
];

CustomError.mergeCodes(_codes);



