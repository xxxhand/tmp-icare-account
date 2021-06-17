import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { TNullable } from '@demo/app-common';
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

	private _init(): void {
		if (!this._app) {
			throw new Error('Application is null');
		}
		this._app.use('/api-docs', express.static(path.resolve(<string>require.main?.path || __dirname, `${_PUBLIC_PATH}/api-docs`)));
		this._app.use(bodyParser.json({ limit: '10mb' }));
		this._app.use(bodyParser.urlencoded({ extended: false }));
		this._app.use(appTracer.handle());
		this._app.use(AppInterceptor.beforeHandler);
		this._app.use('/api/v1', v1Route);
		this._app.use(AppInterceptor.completeHandler);
		this._app.use(AppInterceptor.notFoundHandler);
		this._app.use(AppInterceptor.errorHandler);
	}
}
