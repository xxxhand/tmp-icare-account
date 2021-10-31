import { TNullable } from '@demo/app-common';
import { AccountEntity } from '../entities/account-entity';

export interface IAccountRepository {
  save(account: TNullable<AccountEntity>): Promise<TNullable<AccountEntity>>;
  checkExist(account: string): Promise<boolean>;
  findOneByAccount(account: string): Promise<TNullable<AccountEntity>>;
}