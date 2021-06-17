global.Promise = require('bluebird');
import * as http from 'http';
import { LOGGER, customArgvs } from '@demo/app-common';
import { AppInitializer } from '../bootstrap/app-initializer';
import { App } from '../bootstrap/app';
import { AppWebSocket } from '../bootstrap/app-web-socket';

async function main() {
	LOGGER.info('Initial server start...');
	await AppInitializer.tryDbClient();
	await AppInitializer.tryRedis();
	AppInitializer.tryInjector();
	const _port = Number.parseInt(customArgvs.port, 10);
	const _core = http.createServer(new App().app);

	new AppWebSocket()
		.useHttpServer(_core)
		.loadNamespaces();
    
  
	_core.listen(_port);
	_core.on('listening', () => LOGGER.info(`Server up on ${_port}`));
	_core.on('error', (err: Error) => LOGGER.error(err.stack));

}

main().catch((ex: Error) => LOGGER.error(ex.stack));