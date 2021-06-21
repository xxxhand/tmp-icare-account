import * as path from 'path';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { TNullable, commonInjectorCodes, defaultContainer, IMongooseClient, defConf, LOGGER } from '@demo/app-common';
import { AppInterceptor } from './app-interceptor';
import * as appTracer from './app-request-tracer';
import v1Route from '../application/workflows/v1-route';

const _PUBLIC_PATH = '../../../../public';

export class App {

	private _app: TNullable<express.Application> = null;

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

		this._app.use('/api-docs', express.static(path.resolve(<string>require.main?.path || __dirname, `${_PUBLIC_PATH}/api-docs`)));
		this._app.use(express.json({ limit: '10mb' }));
		this._app.use(express.urlencoded({ extended: false }));
		this._app.use(this._makeSession());
		this._app.use(appTracer.handle());
		this._app.use(AppInterceptor.beforeHandler);
		this._app.use('/api/v1', v1Route);
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
			});
		} catch (ex) {
			LOGGER.warn('Mongo client is null, use memory store for session');
			oStore = new session.MemoryStore();
		}

		return session({
			secret: defConf.SESSION_CONFIGS.SECRET,
			store: oStore,
			resave: true,
			saveUninitialized: true,
			rolling: true,
			cookie: {
				domain: defConf.SESSION_CONFIGS.DOMAIN_NAME,
				secure: true,
				maxAge: defConf.SESSION_CONFIGS.EXPIRES_IN * 1000,
			},
			name: defConf.SESSION_CONFIGS.NAME,
		});
	}
}
