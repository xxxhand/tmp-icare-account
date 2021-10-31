import { IBaseRequest, CustomValidator, validateStrategy } from '@demo/app-common';
import { ErrorCodes } from '../enums/error-codes';

export class LineIOUpdateAccountRequest implements IBaseRequest<LineIOUpdateAccountRequest> {
	phone: string = '';
	name: string = '';
	password: string = '';
	lineId: string = '';

	usePhone(phone: string): LineIOUpdateAccountRequest {
		this.phone = phone;
		return this;
	}

	checkRequired(): LineIOUpdateAccountRequest {
		new CustomValidator()
			.checkThrows(this.phone,
				{ m: ErrorCodes.ERR_PHONE_FORMAT_WRONG, s: validateStrategy.NON_EMPTY_STRING },
				{ m: ErrorCodes.ERR_PHONE_FORMAT_WRONG, fn: (val) => /^09\d{8}$/.test(val) }
			)
			.nonEmptyStringThrows(this.name, ErrorCodes.ERR_NAME_EMPTY)
			.checkThrows(this.password,
				{ m: ErrorCodes.ERR_PASS_WRONG_FORMAT, s: validateStrategy.NON_EMPTY_STRING },
				{ m: ErrorCodes.ERR_PASS_WRONG_FORMAT, fn: (val) => /^(?=.{8,})/.test(val) },
				{ m: ErrorCodes.ERR_PASS_WRONG_FORMAT, fn: (val) => /^(?=.*[0-9])/.test(val) },
				{ m: ErrorCodes.ERR_PASS_WRONG_FORMAT, fn: (val) => /^(?=.*[a-z])/.test(val) }
			)
			.nonEmptyStringThrows(this.lineId, ErrorCodes.ERR_LINE_ID_EMPTY);

		return this;
	}
}
