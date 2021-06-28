export class AccountCheckResponse {
	valid: boolean = true;
	exists: boolean = false;

	exist(): void {
		this.valid = false;
		this.exists = true;
	}
}
