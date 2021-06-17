import { TNullable } from '@demo/app-common';
import { ChatRoomEntity } from '../entities/chat-room-entity';

export interface IChatRoomRepository {
    save(entity: TNullable<ChatRoomEntity>): Promise<TNullable<ChatRoomEntity>>;
    findOne(roomId: string): Promise<TNullable<ChatRoomEntity>>;
}
