import { CustomHttpOption } from '@demo/app-common';
import { AccountCheckResult } from '../../../domain/value-objects/account-check-result';

export interface IAccountService {
  checkAccountExist(account: string, requestOption: CustomHttpOption): Promise<AccountCheckResult>;
}
