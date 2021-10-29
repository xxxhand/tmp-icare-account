import { ExpirationCodes } from '../enums/expiration-codes';

export class CodeEntity {
	public id: string = '';
	public phone: string = '';
	public code: string = '';
	public expiresAt: number = 0;
	public completed: boolean = false;
	public refreshAt: number = 0;

	public refesh(code: string): void {
		this.code = code;
		this.expiresAt = Date.now() + (ExpirationCodes.VERIFY_CODE * 1000);
		this.completed = false;
		this.refreshAt = Date.now();
	}

	public complete(): void {
		this.completed = true;
	}

	public hasExpired(): boolean {
		return Date.now() > this.expiresAt;
	}
}
