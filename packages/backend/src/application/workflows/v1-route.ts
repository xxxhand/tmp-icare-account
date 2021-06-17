import { Request, Response, NextFunction, Router } from 'express';
import { CustomResult } from '@demo/app-common';
import { ClientAuthRoute } from './client-auth-route';

const _router = Router();
_router
	.all('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		res.locals['result'] = new CustomResult<string>().withResult('Hello world');
		await next();
	});

_router
	.use(ClientAuthRoute.build());

export default _router;
