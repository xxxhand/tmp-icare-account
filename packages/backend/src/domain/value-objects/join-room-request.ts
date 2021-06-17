import { IBaseRequest, CustomValidator } from '@demo/app-common';
import { ErrorCodes } from '../enums/error-codes';

export class JoinRoomRequest implements IBaseRequest<JoinRoomRequest> {

    public chatRoomId: string = '';
    public userId: string = '';
    public userName: string = '';

    checkRequired(): JoinRoomRequest {
    	new CustomValidator()
    		.nonEmptyStringThrows(this.chatRoomId, ErrorCodes.CHAT_ROOM_ID_INVALID)
    		.nonEmptyStringThrows(this.userId, ErrorCodes.CLIENT_USER_ID_INVALID)
    		.nonEmptyStringThrows(this.userName, ErrorCodes.CLIENT_USER_NAME_INVALID);
    	return this;
    }
}
