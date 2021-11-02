import { CustomUtils } from '@demo/app-common';

export class AccountEntity {
	id: string = '';
	account: string = '';
	valid: boolean = true;
	isLuna: boolean = false;
	name: string = '';
	nickname: string = '';
	password: string = '';
	salt: string = '';
	phone: string = '';
	lineId: string = '';

	public passwordEqualsTo(inputPassword: string): boolean {
		if (this.isLuna) {
			return true;
		}
		return CustomUtils.isEqual(this.password, inputPassword);
	}
}
