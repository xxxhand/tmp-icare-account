import * as path from 'path';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { TNullable, commonInjectorCodes, defaultContainer, IMongooseClient, defConf, LOGGER, CustomValidator } from '@demo/app-common';
import { AppInterceptor } from './app-interceptor';
import * as appTracer from './app-request-tracer';
import { V1Router } from '../application/workflows/v1-router';
import { MockRouter } from '../application/workflows/mock-router';
import { LineIOV1Router } from '../application/workflows/line-io-v1-router';


export class App {

	private _app: TNullable<express.Application> = null;
	private readonly _PUBLIC_PATH = '../../../../public';

	constructor() {
		this._app = express();
		this._init();
	}

	get app(): express.Application {
		if (!this._app) {
			throw new Error('Application is null');
		}
		return this._app;
	}

	private _init = (): void => {
		if (!this._app) {
			throw new Error('Application is null');
		}

		this._app.use('/line_io/api-docs', express.static(path.resolve(<string>require.main?.path || __dirname, `${this._PUBLIC_PATH}/api-docs`)));
		this._app.use('/line_io/liff', express.static(path.resolve(<string>require.main?.path || __dirname, `${this._PUBLIC_PATH}/liff`)));
		this._app.use(express.json({ limit: '10mb' }));
		this._app.use(express.urlencoded({ extended: false }));
		this._app.use(this._makeSession());
		this._app.use(appTracer.handle());
		this._app.use(AppInterceptor.beforeHandler);
		this._app.use(AppInterceptor.authenticationHandler);
		
		const lineIOV1Router = new LineIOV1Router();
		this._app.use(lineIOV1Router.prefix, lineIOV1Router.router);
		
		const v1Router = new V1Router();
		this._app.use(v1Router.prefix, v1Router.router);

		const mockRouter = new MockRouter();
		this._app.use(mockRouter.prefix, mockRouter.router);

		this._app.use(AppInterceptor.completeHandler);
		this._app.use(AppInterceptor.notFoundHandler);
		this._app.use(AppInterceptor.errorHandler);
	}

	private _makeSession = (): express.RequestHandler => {
		let oStore: TNullable<session.Store> = undefined;
		try {
			const mClient = defaultContainer.getNamed<IMongooseClient>(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
			oStore = new MongoStore({
				client: mClient.getNativeClient(),
				ttl: defConf.SESSION_CONFIGS.EXPIRES_IN,
				autoRemove: 'disabled',
			});
		} catch (ex) {
			LOGGER.warn('Mongo client is null, use memory store for session');
			oStore = new session.MemoryStore();
		}

		const oDomain: TNullable<string> = CustomValidator.nonEmptyString(defConf.SESSION_CONFIGS.DOMAIN_NAME) ? defConf.SESSION_CONFIGS.DOMAIN_NAME : void 0;

		return session({
			secret: defConf.SESSION_CONFIGS.SECRET,
			store: oStore,
			resave: true,
			saveUninitialized: true,
			rolling: true,
			cookie: {
				domain: oDomain,
				secure: oDomain ? true : false,
				maxAge: defConf.SESSION_CONFIGS.EXPIRES_IN * 1000,
			},
			name: defConf.SESSION_CONFIGS.NAME,
		});
	}
}
