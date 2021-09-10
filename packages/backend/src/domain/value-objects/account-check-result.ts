export class AccountCheckResult {
	valid: boolean = true;
	exists: boolean = false;

	exist(): void {
		this.valid = false;
		this.exists = true;
	}

	isValid(): boolean {
		return this.valid;
	}
}
