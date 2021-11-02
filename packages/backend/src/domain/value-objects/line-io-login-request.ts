import { IBaseRequest, CustomValidator } from '@demo/app-common';
import { ErrorCodes } from '../enums/error-codes';

export class LineIOLoginRequest implements IBaseRequest<LineIOLoginRequest> {
  account: string = '';
  password: string = '';
  lineId: string = '';

  checkRequired(): LineIOLoginRequest {
  	new CustomValidator()
  		.nonEmptyStringThrows(this.account, ErrorCodes.ERR_ACCOUNT_EMPTY)
  		.nonEmptyStringThrows(this.password, ErrorCodes.ERR_ACCOUNT_PASS_WRONG)
  		.nonEmptyStringThrows(this.lineId, ErrorCodes.ERR_LINE_ID_EMPTY);

  	return this;
  }
}
