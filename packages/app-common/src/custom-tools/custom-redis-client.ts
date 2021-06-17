import IORedis, { Redis, RedisOptions } from 'ioredis';
import { logger as LOGGER } from '../custom-tools/custom-logger';
import { ICustomRedisClient, TNullable } from '../custom-types';

export class CustomRedisClient implements ICustomRedisClient {
	private _isConnected: boolean = false;
	private _client: TNullable<Redis> = null;

	tryConnect = async (opts: RedisOptions): Promise<void> => {
		return new Promise<void>((res) => {
			this._client = new IORedis({host: opts.host, port: opts.port, password: opts.password, db: opts.db });
			this._client.on('connect', this._onConnect);
			this._client.on('error', this._onError);
			this._client.on('close', this._onClose);
			this._client.once('ready', () => {
				LOGGER.info('[CustomRedisClient] ready');
				return res();
			});
		});
	}

	open = (): Redis => {
		if (!this._client) {
			throw new Error('[CustomRedisClient] Client is null');
		}
		return this._client;
	}

	close = (): void => {
		if (!this._client) {
			return;
		}
		this._isConnected = false;
		this._client.removeAllListeners();
	}

	isConnected(): boolean {
		return this._isConnected;
	}

	private _onConnect = (): void => {
		LOGGER.info('[CustomRedisClient] connected');
		this._isConnected = true;
	}

	private _onClose = (): void => {
		LOGGER.info('[CustomRedisClient] closed');
		this._isConnected = false;
		this._client?.removeAllListeners();
	}

	private _onError = (err: Error): void => {
		LOGGER.error(`[CustomRedisClient] Error ${err.stack}`);
		this._isConnected = false;
		this._client?.removeAllListeners();
	}
}
