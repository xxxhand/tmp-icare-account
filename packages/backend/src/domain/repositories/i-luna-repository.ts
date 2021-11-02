import { CustomHttpOption, TNullable } from '@demo/app-common';
import { ILunaLoginData } from '../../infra/types/luna-api-types';

export interface ILunaRepository {
  accountExist(account: string, requestOptions: CustomHttpOption): Promise<boolean>;
  login(account: string, password: string, requestOptions: CustomHttpOption): Promise<TNullable<ILunaLoginData>>;
}
