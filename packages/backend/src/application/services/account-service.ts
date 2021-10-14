import { injectable } from 'inversify';
import {
	CustomHttpOption,
	lazyInject,
	TNullable,
	LOGGER,
	CustomValidator,
	ErrorCodes,
	validateStrategy,
} from '@demo/app-common';
import { IAccountService } from './interfaces/i-account-service';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { AccountCheckResult } from '../../domain/value-objects/account-check-result';
import { ILunaRepository } from '../../domain/repositories/i-luna-repository';
import { IAccountRepository } from '../../domain/repositories/i-account-repository';

@injectable()
export class AccountService implements IAccountService {

	@lazyInject(InjectorCodes.I_LUNA_REPO)
	private _lunaRepo: TNullable<ILunaRepository>;
	@lazyInject(InjectorCodes.I_ACCOUNT_REPO)
	private _accountRepo: TNullable<IAccountRepository>;
	private _twnMobileFormat = /^09\d{8}$/;

	checkAccountExist = async (account: string, requestOption: CustomHttpOption): Promise<AccountCheckResult> => {
		new CustomValidator()
			.checkThrows(account,
				{ m: ErrorCodes.ERR_MUST_BE_MOBILE, s: validateStrategy.NON_EMPTY_STRING },
				{ m: ErrorCodes.ERR_MUST_BE_MOBILE, fn: (val) => this._twnMobileFormat.test(val) }
			);

		const result = new AccountCheckResult();
		LOGGER.info(`Find account ${account} from Luna`);
		let existAccount = await this._lunaRepo?.accountExist(account, requestOption);
		if (existAccount) {
			result.exist();
			return result;
		}
		LOGGER.info(`Find account ${account} from icare`);
		existAccount = await this._accountRepo?.checkExist(account);
		if (existAccount) {
			result.exist();
			return result;
		}

		return result;
	}
}
