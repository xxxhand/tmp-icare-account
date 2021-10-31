import { CustomValidator } from '@demo/app-common';
import { ErrorCodes } from '../enums/error-codes';
import { LineIOUpdateAccountRequest } from './line-io-update-account-request';

export class LineIORegisterRequest extends LineIOUpdateAccountRequest {
	code: string = '';

	constructor() {
		super();
	}

	checkRequired(): LineIORegisterRequest {
		super.checkRequired();
		new CustomValidator().nonEmptyStringThrows(this.code, ErrorCodes.ERR_CODE_WRONG);
			
		return this;
	}
}
