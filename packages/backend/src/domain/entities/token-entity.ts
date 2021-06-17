export class  TokenEntity {
    public token: string = '';
    public clientId: string = '';
    public expiredAt: number = -1;

    hasExpired(): boolean {
    	return this.expiredAt < Date.now();
    }
}
