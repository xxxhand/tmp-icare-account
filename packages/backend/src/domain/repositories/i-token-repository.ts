import { TNullable } from '@demo/app-common';
import { TokenEntity } from '../entities/token-entity';

export interface ITokenRepository {
    save(entity: TNullable<TokenEntity>): Promise<TNullable<TokenEntity>>;
    findOne(token: string): Promise<TNullable<TokenEntity>>;
}
