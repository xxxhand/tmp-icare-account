import { Request, Response, NextFunction } from 'express';
import { defaultNameSpace, CustomUtils, TNullable } from '@demo/app-common';

const _forExpress = ({ useHeader = true, headerName = 'X-Request-Id' } = {}) => (req: Request, res: Response, next: NextFunction) => {
	defaultNameSpace.bindEmitter(req);
	defaultNameSpace.bindEmitter(res);

	let reqId: TNullable<string> = '';
	if (useHeader) {
		reqId = req.headers[headerName.toLowerCase()] as TNullable<string>;
	}
	reqId = reqId || CustomUtils.generateUUIDV4();
	defaultNameSpace.run(() => {
		defaultNameSpace.set('requestId', reqId);
		next();
	});
};

export const handle = _forExpress;