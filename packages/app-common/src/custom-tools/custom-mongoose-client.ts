import { Schema, Model, ConnectOptions, Mongoose, Connection, Document } from 'mongoose';
import { IMongooseClient, TNullable } from '../custom-types';
import { logger as LOGGER } from '../custom-tools/custom-logger';
import { customArgvs } from '../custom-tools/custom-argvs';
import { CustomValidator } from '../custom-tools/custom-validator';
import { CustomUtils } from '../custom-tools/custom-utils';

export class CustomMongooseClient implements IMongooseClient {
	private _uri?: string;
	private _instance?: Mongoose;
	private _conn?: Connection;
	private _isConnected = false;
	private _numberOfRetries = 0;
	private _defaultOptions: ConnectOptions = {
		maxPoolSize: 10,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		connectTimeoutMS: 3 * 1000,
		useCreateIndex: true,
	};
	private _ignoreClearEnvs: Array<string> = [];

	constructor(uri: string, options: ConnectOptions) {
		this._uri = uri;
		if (options) {
			const copiedOption = CustomUtils.deepClone(options);
			this._defaultOptions = { ...this._defaultOptions, ...copiedOption };
		}
		if (!CustomValidator.nonEmptyString(this._defaultOptions.user || '')) {
			this._defaultOptions.user = undefined;
			this._defaultOptions.pass = undefined;
		}
		this._instance = new Mongoose();
	}
	close = async (): Promise<void> => {
		this._conn?.removeAllListeners();
		await this._conn?.close();
	}
	ignoreClearEnvironments = (...envs: Array<string>): void => {
		envs.forEach(x => this._ignoreClearEnvs.push(x));
	}
	isConnected = (): boolean => {
		return this._isConnected;
	}
	tryConnect = (): Promise<void> => {
		LOGGER.info(`Try connecting for ${this._numberOfRetries} times`);
		if (!this._uri || this._uri.length === 0) {
			throw new Error('Connection uri is empty');
		}
		this._conn = this._instance?.createConnection(this._uri, this._defaultOptions);
		this._conn?.on('connected', this._onConnected);
		this._conn?.on('error', this._onError);
		this._conn?.on('close', this._onClose);
		this._conn?.on('disconnected', this._onDisconnected);
		return new Promise((res, rej) => {
			this._conn?.once('open', () => {
				LOGGER.info('DB opened...');
				res();
			});
			this._conn?.once('error', (err) => {
				rej(err);
			});
		});
	}
	registerModel = <T extends Document<any>>(name: string, schema: Schema<any>): TNullable<Model<T>> => {
		if (!CustomValidator.nonEmptyString(name)) {
			throw new Error('Model name must not be empty');
		}
		if (!schema || !(schema instanceof Schema)) {
			throw new Error('Schema type was worng');
		}
		LOGGER.info(`Default Db client - ${name} registered`);
		return this._conn?.model<T>(name, schema);
	}
	getModel = <T extends Document<any>>(name: string): Model<T> => {
		const m = this._conn?.models[name];
		if (!m) {
			throw new Error(`Model ${name} is not founded`);
		}
		return m;
	}
	clearData = async (): Promise<void> => {
		if (this._ignoreClearEnvs.includes(customArgvs.env)) {
			LOGGER.info(`Not allowed to clean ${customArgvs.env}`);
			return;
		}
		if (!this._conn) {
			return;
		}
		const tasks = [];
		for (const name of this._conn.modelNames()) {
			LOGGER.info(`Default Db client - clear ${name} data`);
			tasks.push(this._conn.models[name].deleteMany());
		}
		await Promise.all(tasks);
	}

	private _onConnected = (): void => {
		this._isConnected = false;
		this._numberOfRetries = 0;
		LOGGER.info('Connect to db success');
	}

	private _onError = (err: Error): void => {
		this._isConnected = false;
		LOGGER.error(`Connect to db fail ${err.stack}`);
		this.tryConnect();
	}

	private _onClose = (): void => {
		this._isConnected = false;
		LOGGER.info(`${this._defaultOptions.dbName} connection closed`);
	}

	private _onDisconnected(): void {
		this._isConnected = false;
		this._numberOfRetries += 1;
		this._conn?.removeAllListeners();
		LOGGER.info(`${this._defaultOptions.dbName} disconnected...`);
		this.tryConnect();
	}
}