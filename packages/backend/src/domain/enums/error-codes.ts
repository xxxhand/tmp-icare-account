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
	ERR_ACCOUNT_EXISTS = 'ERR_ACCOUNT_EXISTS',
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
		alias: 'ERR_ACCOUNT_EXISTS',
		code: 10004,
		httpStatus: 400,
		message: '帳號已被註冊',
	}
];

CustomError.mergeCodes(_codes);



