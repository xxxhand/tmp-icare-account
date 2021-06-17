import { TNullable } from '@demo/app-common';
import { RoomStatusCodes } from '../enums/room-status-codes';

export class ChatRoomEntity {
    public chatRoomId: string = '';
    public hostId: string = '';
    public status: number = RoomStatusCodes.OPEN;
    public openedAt: TNullable<Date> = null;
    public closedAt: TNullable<Date> = null;

    isOpened(): boolean {
    	return this.status === RoomStatusCodes.OPEN;
    }
}
