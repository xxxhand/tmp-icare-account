import { Request, Response, NextFunction, Router } from 'express';
import { injectable } from 'inversify';
import {
	CustomClassBuilder,
	CustomResult,
	defaultContainer,
	lazyInject,
	TNullable,
	CustomUtils,
	LOGGER,
} from '@demo/app-common';
import { handleExpressAsync, ICustomExpressRequest } from '../application-types';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { IClientRepository } from '../../domain/repositories/i-client-repository';
import { RegisterClientRequest } from '../../domain/value-objects/register-client-request';
import { ClientEntity } from '../../domain/entities/client-entity';

@injectable()
export class ClientAuthController {

	@lazyInject(InjectorCodes.I_CLIENT_REPO)
	private _repo: TNullable<IClientRepository>;

	public create = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {

		const mReq = CustomClassBuilder.build(RegisterClientRequest, req.body)?.checkRequired();
		LOGGER.info(`Create new client for ${mReq?.name}`);
		const entity = <ClientEntity>CustomClassBuilder.build(ClientEntity, mReq);
		entity.clientId = CustomUtils.generateUniqueId();
		entity.clientSecret = CustomUtils.generateUniqueId();
		await this._repo?.save(entity);

		res.locals['result'] = new CustomResult().withResult(entity);
		await next();
	}

	public static build(): Router {
		defaultContainer.bind(ClientAuthController).toSelf().inSingletonScope();
		const _ctrl = defaultContainer.get(ClientAuthController);
		const r = Router();
		r.route('/client-auth')
			.post(handleExpressAsync(_ctrl.create));

		return r;
	}
}

