import { injectable } from 'inversify';
import { ICustomHttpClient, CustomHttpOption, CustomResult } from '@demo/app-common';

@injectable()
export class MockAuthorize implements ICustomHttpClient {
	tryPostJson(option: CustomHttpOption): Promise<CustomResult> {
		throw new Error('Method not implemented.');
	}
	tryPostForm(option: CustomHttpOption): Promise<CustomResult> {
		throw new Error('Method not implemented.');
	}
    tryGet = async (option: CustomHttpOption): Promise<CustomResult> => {
    	return new CustomResult();
    }

}