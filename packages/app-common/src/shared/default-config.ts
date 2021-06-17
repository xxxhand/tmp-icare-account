import * as fs from 'fs';
import * as path from 'path';
import { logger as LOGGER } from '../custom-tools/custom-logger';
import { customArgvs } from '../custom-tools/custom-argvs';
import { CustomValidator } from '../custom-tools/custom-validator';
import { TNullable, IConfig } from '../custom-types';

LOGGER.info(`Run on environment ${customArgvs.env}`);
LOGGER.info('Load config start...');
let _configPath: TNullable<string> = customArgvs.configpath;
if (!CustomValidator.nonEmptyString(_configPath)) {
	LOGGER.info('Input argv is empty, load from default...');
	_configPath = `./configs`;
}
// if (_configPath.startsWith('.') || _configPath.startsWith('..')) {
//   throw new Error(`Path must be absolutely`);
// }
_configPath = path.resolve(require.main?.path || __dirname, `${_configPath}/config.${customArgvs.env}.json`);
if (!fs.existsSync(_configPath)) {
	throw new Error(`File not exist with path ${_configPath}`);
}

let _config: IConfig;
try {
	const data = fs.readFileSync(_configPath);
	_config = <IConfig>JSON.parse(data.toString('utf-8'));
} catch (ex) {
	LOGGER.error(ex.stack);
	throw ex;
}

export const defaultConfig = _config;