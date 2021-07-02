import { CustomHttpOption } from '@demo/app-common';

export interface ILunaRepository {
  accountExist(account: string, requestOptions: CustomHttpOption): Promise<boolean>;
}
