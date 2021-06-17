import { IBaseRequest, CustomValidator, validateStrategy } from '@demo/app-common';
import { ErrorCodes } from '../enums/error-codes';

const _DEF_PROTOCAL = /^(http|https):\/\//;

export class RegisterClientRequest implements IBaseRequest<RegisterClientRequest> {
    public name: string = '';
    public callbackUrl: string = '';

    checkRequired(): RegisterClientRequest {
    	new CustomValidator()
    		.nonEmptyStringThrows(this.name, ErrorCodes.CLIENT_NAME_INVALID)
    		.checkThrows(this.callbackUrl,
    			{ s: validateStrategy.NON_EMPTY_STRING, m: ErrorCodes.CLIENT_CALLBACK_INVALID },
    			{ m: ErrorCodes.CLIENT_CALLBACK_INVALID, fn: (val: string) => _DEF_PROTOCAL.test(val) }
    		);

    	return this;
    }

}