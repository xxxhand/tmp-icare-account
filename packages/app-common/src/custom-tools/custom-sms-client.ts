import net from 'net';
import { Struct } from 'struct';
import pEvent from 'p-event';
import { smsOptions, ISMSClient, TNullable } from '../custom-types';
import { logger as LOGGER } from '../custom-tools/custom-logger';
import { CustomValidator } from '../custom-tools/custom-validator';
import { CustomError } from '../custom-models/custom-error';

//#region Defined for internal usage
/** 訊息型態 */
enum MsgType {
	/** Login */
	Login = 0,
	/** Send message */
	Send = 1,
	/** Query status */
	Query = 2,
	/** Done */
	Done = 3,
}

/** 訊息編碼種類 */
enum MsgCoding {
	/** Big5 */
	Big5 = 1,
	/** Binary */
	Binary = 2,
	/** unicode(ucs-2) */
	UCS2 = 3,
	/** unicode(UTF-8) */
	UTF8 = 4,
}

/** 回傳碼-建立連線(帳號/密碼確認) */
enum RetCodeLogin {
	/** ID/Password check successful */
	Success = 0,
	/** Password error */
	PwdErr = 1,
	/** The account not exist */
	AcctErr = 2,
	/** Over the maximun allowed connection number */
	OverConn = 3,
	/** The account status not correct */
	AcctStatusErr = 4,
	/** Get account data error */
	GetAcctErr = 5,
	/** Get password data error */
	GetPwdErr = 6,
	/** System error, try again later */
	SystemErr = 7,
}

/** 回傳碼-訊息傳送 */
enum RetCodeSend {
	/** MessageID */
	Success = 0,
	/** Country code format error */
	CountryErr = 1,
	/** Coding format error */
	CodingErr = 2,
	/** Priority format error */
	PriorityErr = 3,
	/** Msg_content_len format error */
	ContentLenFormatErr = 4,
	/** Msg_content_len not the same with msg_content */
	ContentLenErr = 5,
	/** Telephone number format error */
	PhoneNumErr = 6,
	/** Transfer type format error */
	TransferTypeErr = 7,
	/** Limit time format error */
	LimitTimeErr = 8,
	/** Ordered time format error */
	OrderedTimeErr = 9,
	/** Send to foreign not allow now */
	ForeignNotAllow = 10,
	/** Message sending failure, try again */
	SendFailure = 11,
	/** Message out of sequence */
	MsgOutOfSequence = 12,
	/** Wap push url length is zero */
	WapUrlLenZero = 13,
	/** Wap push msg_content length bigger than 88 */
	WapContentLenOver = 14,
	/** Billing user_hn format error */
	BillErr = 15,
	/** Message has 9-10 digits tel number */
	HasTelNum = 16,
}

/** 資料欄位名 */
enum MsgColumes {
	MsgType = 'msgType',
	MsgCoding = 'msgCoding',
	MsgPriority = 'msgPriority',
	MsgCountryCode = 'msgCountryCode',
	MsgSetLen = 'msgSetLen',
	MsgContentLen = 'msgContentLen',
	MsgSet = 'msgSet',
	MsgContent = 'msgContent',
}

/** SMS Server 回傳訊息欄位名 */
enum ReturnDataColumns {
	RetCode = 'retCode',
	RetCoding = 'retCoding',
	RetSetLen = 'retSetLen',
	RetContentLen = 'retContentLen',
	RetSet = 'retSet',
	RetContent = 'retContent',
}

/** SMS Server 回傳訊息 */
interface IReturnData {
	code: number;
	content: string;
}

//#endregion

export class CustomSMSClient implements ISMSClient {
	private readonly _STR_NUL = '\0';
	/** Immediate and re-send timeout */
	private readonly _SEND_TYPE = '02';
	/** Re-send timeout: 30 mins */
	private readonly _RESEND_TIMEOUT = '0030';
	/** SMS gateway return message length */
	private readonly _RET_MSG_LEN = 244;
	/** p-event listen timeout */
	private readonly _EVENT_TIMEOUT = 3000;
	/** max retry socket connect imit */
	private readonly _DEFAULT_MAX_RETRY_CONNECT_LIMIT = 3;
	private _client: TNullable<net.Socket>;
	private _isLogged: boolean = false;
	private _isSendingSMS: boolean = false;
	private _connected: boolean = false;
	private _smsOptions: smsOptions;

	constructor(opt: smsOptions) {
		this._smsOptions = opt;
	}
	isConnected(): boolean {
		return this._connected;
	}

	isLogged(): boolean {
		return this._isLogged;
	}

	tryConnect = async (): Promise<void> => {
		await this._retryConnect();
		await this._login();
	}

	send = async (phone: string, message: string): Promise<boolean> => {
		if (!CustomValidator.nonEmptyString(phone)) {
			throw new Error('Parameter `phone` is empty.');
		}
		if (!/^09\d{8}$/.test(phone)) {
			throw new Error('Parameter `phone` is invalid.');
		}
		if (!CustomValidator.nonEmptyString(message)) {
			throw new Error('Parameter `message` is empty.');
		}
		if (!this._client) {
			throw new Error('Client does not connect to a socket server.');
		}
		if (!this.isConnected()) {
			throw new Error('This socket has been ended.');
		}
		if (!this.isLogged()) {
			throw new Error('Client does not login.');
		}
		if (this._isSendingSMS) {
			throw new Error('Client is sending another sms.');
		}
		try {
			this._isSendingSMS = true;
			const smsMsgBuffer = this._buildMessageBuffer(phone, message);
			this._client.write(smsMsgBuffer);
			const retMsg = await pEvent(this._client, 'data', { timeout: this._EVENT_TIMEOUT });
			const { code, content } = this._parseReturnData(retMsg);
			this._isSendingSMS = false;
			if (code === RetCodeSend.Success) {
				LOGGER.info(`DefaultSMSClient - Send sms to ${phone} successfully. MessageID=${content}`);
			} else {
				LOGGER.error(`DefaultSMSClient - Send sms to ${phone} failed. retCode=${code}, retContent=${content}`);
			}
			return code === RetCodeSend.Success;
		} catch (error) {
			this._isSendingSMS = false;
			throw error;
		}
	}

	close = async (): Promise<void> => {
		this._connected = false;
		this._isLogged = false;
		this._isSendingSMS = false;
		if (this._client) {
			LOGGER.info(`Close client`);
			this._client.removeAllListeners();
			this._client.end();
			this._client = null;
		}
	}

	private _retryConnect = async (times: number = 1): Promise<boolean> => {
		if (this.isConnected()) {
			return true;
		}
		LOGGER.info(`Retry connect SMS server ${times}`);
		try {
			this._connected = false;
			this._client = net.createConnection({ host: this._smsOptions.host, port: this._smsOptions.port });
			this._client.on('close', this.close);
			await pEvent(this._client, 'ready', { timeout: this._EVENT_TIMEOUT });
			this._connected = true;
			return true;
		} catch (ex) {
			const err = CustomError.fromInstance(ex);
			LOGGER.error(`Retry connect SMS server fail ${err.stack}`);
			if (times === this._smsOptions.maxTryLimit) {
				return this._retryConnect(times + 1);
			}
			return false;
		}
	}

	private _login = async (): Promise<void> => {
		if (!this._client) {
			throw new Error(`[SMS] Socket client is null`);
		}
		if (this.isLogged()) {
			return;
		}
		this._isLogged = false;
		const loginBuf = this._buildLoginBuffer();
		this._client.write(loginBuf);
		const returnBuf = await pEvent(this._client, 'data', { timeout: this._EVENT_TIMEOUT });
		const data = this._parseReturnData(returnBuf);
		if (data.code === RetCodeLogin.Success) {
			this._isLogged = true;
			return;
		}
		LOGGER.error(`Login SMS server fail ${data.content}`);
	}

	private _buildLoginBuffer = (): Buffer => {
		const s = new Struct()
			.word8(MsgColumes.MsgType)
			.word8(MsgColumes.MsgCoding)
			.word8(MsgColumes.MsgPriority)
			.word8(MsgColumes.MsgCountryCode)
			.word8(MsgColumes.MsgSetLen)
			.word8(MsgColumes.MsgContentLen)
			.chars(MsgColumes.MsgSet, 100)
			.chars(MsgColumes.MsgContent, 160, 'ucs2');

		const buff = s.allocate().buffer();
		s.fields[MsgColumes.MsgType] = MsgType.Login;
		s.fields[MsgColumes.MsgCoding] = MsgCoding.UCS2;
		s.fields[MsgColumes.MsgPriority] = 0;
		s.fields[MsgColumes.MsgCountryCode] = 0;
		s.fields[MsgColumes.MsgSetLen] = `${this._smsOptions.account}${this._STR_NUL}${this._smsOptions.password}${this._STR_NUL}`.length;
		s.fields[MsgColumes.MsgContentLen] = 0;
		s.fields[MsgColumes.MsgSet] = `${this._smsOptions.account}${this._STR_NUL}${this._smsOptions.password}${this._STR_NUL}`;
		s.fields[MsgColumes.MsgContent] = '0';

		return buff;
	}

	private _buildMessageBuffer = (phone: string, message: string): Buffer => {
		// return Buffer.from('I am message');
		const sendMsgStruct = new Struct()
			.word8(MsgColumes.MsgType)
			.word8(MsgColumes.MsgCoding)
			.word8(MsgColumes.MsgPriority)
			.word8(MsgColumes.MsgCountryCode)
			.word8(MsgColumes.MsgSetLen)
			.word8(MsgColumes.MsgContentLen)
			.chars(MsgColumes.MsgSet, 100)
			.chars(MsgColumes.MsgContent, 160, 'ucs2');

		const sendMsgBuffer = sendMsgStruct.allocate().buffer();
		sendMsgStruct.fields[MsgColumes.MsgType] = MsgType.Send;
		sendMsgStruct.fields[MsgColumes.MsgCoding] = MsgCoding.UCS2;
		sendMsgStruct.fields[MsgColumes.MsgPriority] = 0;
		sendMsgStruct.fields[MsgColumes.MsgCountryCode] = 0;
		sendMsgStruct.fields[MsgColumes.MsgSetLen] = (phone + this._STR_NUL + this._SEND_TYPE + this._STR_NUL + this._RESEND_TIMEOUT + this._STR_NUL).length;
		sendMsgStruct.fields[MsgColumes.MsgContentLen] = message.length * 2;
		sendMsgStruct.fields[MsgColumes.MsgSet] = phone + this._STR_NUL + this._SEND_TYPE + this._STR_NUL + this._RESEND_TIMEOUT + this._STR_NUL;
		sendMsgStruct.fields[MsgColumes.MsgContent] = message;
		// msgContent le to be
		for (let i = 106; i < 266; i += 2) {
			const tmp = sendMsgBuffer[i];
			sendMsgBuffer[i] = sendMsgBuffer[i + 1];
			sendMsgBuffer[i + 1] = tmp;
		}
		return sendMsgBuffer;
	}

	private _parseReturnData = (buf: Buffer): IReturnData => {
		if (buf.length !== this._RET_MSG_LEN) {
			throw new Error(`Unexpected message length: ${buf.length}`);
		}

		const s = new Struct()
			.word8(ReturnDataColumns.RetCode)
			.word8(ReturnDataColumns.RetCoding)
			.word8(ReturnDataColumns.RetSetLen)
			.word8(ReturnDataColumns.RetContentLen)
			.chars(ReturnDataColumns.RetSet, 80)
			.chars(ReturnDataColumns.RetContent, 160);

		s.setBuffer(buf);

		return {
			code: s.get(ReturnDataColumns.RetCode),
			content: s.get(ReturnDataColumns.RetContent),
		};
	}
}
