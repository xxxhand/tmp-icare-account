import { TNullable } from '@demo/app-common';
import { ClientEntity } from '../entities/client-entity';

export interface IClientRepository {
    save(entity: TNullable<ClientEntity>): Promise<TNullable<ClientEntity>>;
    findOne(clientId: string): Promise<TNullable<ClientEntity>>;
    checkIdentity(userId: string, entity: TNullable<ClientEntity>): Promise<boolean>;
}
