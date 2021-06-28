import { injectable } from 'inversify';
import { ICustomHttpClient, CustomHttpOption, CustomResult, TNullable } from '@demo/app-common';

@injectable()
export class MockLunaAccountNotExist implements ICustomHttpClient {
	tryPostJson = async (option: TNullable<CustomHttpOption>): Promise<CustomResult<any>> => {
		return new CustomResult()
			.withResult({
				success: true,
				data: {
					accountExists: false,
				},
			});
	}
	tryPostForm(option: TNullable<CustomHttpOption>): Promise<CustomResult<any>> {
		throw new Error('Method not implemented.');
	}
	tryGet(option: TNullable<CustomHttpOption>): Promise<CustomResult<any>> {
		throw new Error('Method not implemented.');
	}
}
