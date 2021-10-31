import { TNullable } from '@demo/app-common';
import { CodeEntity } from '../entities/code-entity';

export interface ICodeRepository {
  findOneByPhone(phone: string): Promise<TNullable<CodeEntity>>;
  save(entity: CodeEntity): Promise<TNullable<CodeEntity>>;
}
