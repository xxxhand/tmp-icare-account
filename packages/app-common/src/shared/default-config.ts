import * as fs from 'fs';
import * as path from 'path';
import { logger as LOGGER } from '../custom-tools/custom-logger';
import { customArgvs } from '../custom-tools/custom-argvs';
import { CustomValidator } from '../custom-tools/custom-validator';
import { TNullable } from '../custom-types';


interface IConfig {
	ENABLE_CACHE: boolean,
	DEFAULT_MONGO: {
		URI: string;
		USER?: string;
		PASS?: string;
		POOL_SIZE: number;
		DB_NAME: string;
	},
	DEFAULT_REDIS: {
		URI: string;
		HOST: string,
		PORT: number,
		PASS?: string;
		DB_NAME: number;
  },
	SESSION_CONFIGS: {
		SECRET: string,
		EXPIRES_IN: number,
		DOMAIN_NAME: string,
		NAME: string,
	},
}

LOGGER.info(`Run on environment ${customArgvs.env}`);
LOGGER.info('Load config start...');
let _configPath: TNullable<string> = customArgvs.configpath;
if (!CustomValidator.nonEmptyString(_configPath)) {
	LOGGER.info('Input argv is empty, load from default...');
	_configPath = `./configs`;
}
_configPath = path.resolve(require.main?.path || __dirname, `${_configPath}/config.${customArgvs.env}.json`);
if (!fs.existsSync(_configPath)) {
	throw new Error(`File not exist with path ${_configPath}`);
}

let _config: IConfig;
try {
	const data = fs.readFileSync(_configPath);
	_config = <IConfig>JSON.parse(data.toString('utf-8'));

	// Read DB config from process.env if sets...
	if (CustomValidator.nonEmptyString(process.env.X_DEF_MONGO_URI)) {
		_config.DEFAULT_MONGO.URI = <string>process.env.X_DEF_MONGO_URI;
	}
	if (CustomValidator.nonEmptyString(process.env.X_DEF_MONGO_USER)) {
		_config.DEFAULT_MONGO.USER = process.env.X_DEF_MONGO_USER;
	}
	if (CustomValidator.nonEmptyString(process.env.X_DEF_MONGO_PASS)) {
		_config.DEFAULT_MONGO.PASS = process.env.X_DEF_MONGO_PASS;
	}
	if (CustomValidator.nonEmptyString(process.env.X_DEF_MONGO_POOL_SIZE)) {
		_config.DEFAULT_MONGO.POOL_SIZE = Number.parseInt(<string>process.env.X_DEF_MONGO_POOL_SIZE, 10);
	}
	if (CustomValidator.nonEmptyString(process.env.X_DEF_MONGO_DB_NAME)) {
		_config.DEFAULT_MONGO.DB_NAME = <string>process.env.X_DEF_MONGO_DB_NAME;
	}

	// Read Redis config from process.env if sets...
	if (CustomValidator.nonEmptyString(process.env.X_DEF_REDIS_URI)) {
		_config.DEFAULT_REDIS.URI = <string>process.env.X_DEF_REDIS_URI;
	}
	if (CustomValidator.nonEmptyString(process.env.X_DEF_REDIS_HOST)) {
		_config.DEFAULT_REDIS.HOST = <string>process.env.X_DEF_MONGO_HOST;
	}
	if (CustomValidator.nonEmptyString(process.env.X_DEF_REDIS_PASS)) {
		_config.DEFAULT_REDIS.PASS = process.env.X_DEF_REDIS_PASS;
	}
	if (CustomValidator.nonEmptyString(process.env.X_DEF_REDIS_PASS)) {
		_config.DEFAULT_REDIS.PORT = Number.parseInt(<string>process.env.X_DEF_REDIS_PORT, 10);
	}
	if (CustomValidator.nonEmptyString(process.env.X_DEF_REDIS_DB_NAME)) {
		_config.DEFAULT_REDIS.DB_NAME = Number.parseInt(<string>process.env.X_DEF_REDIS_DB_NAME, 10);
	}
} catch (ex) {
	LOGGER.error(ex.stack);
	throw ex;
}

export const defaultConfig = _config;