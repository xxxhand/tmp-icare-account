import { Server as SocketServer } from 'socket.io';
import * as ioAdapter from 'socket.io-redis';
import { Server as HttpServer } from 'http';
import { TNullable, LOGGER, defaultContainer, defConf } from '@demo/app-common';
import { InjectorCodes } from '../domain/enums/injector-codes';
import { AbstractSocketHandler } from '../application/workflows/abstract-socket-handler';

export class AppWebSocket {
  private _namespaces: Set<string> = new Set();
  private _server: TNullable<SocketServer> = null;

  useHttpServer = (httpServer: HttpServer): AppWebSocket => {
  	this._server = new SocketServer(httpServer);
  	return this;
  }

  registerNamespace = (handler: AbstractSocketHandler): void => {
  	LOGGER.info(`Load namespace ${handler.path}`);
  	if (!this._server) {
  		throw new Error(`Socket server not initlized...`);
  	}
  	if (this._namespaces.has(handler.path)) {
  		throw new Error(`Duplicated namespace ${handler.path}`);
  	}
    
  	this._server
  		.of(handler.path)
  		.use(handler.onAuthorize)
  		.on('connection', handler.onConnection);
  }

  loadNamespaces = (): AppWebSocket => {
  	if (!this._server) {
  		throw new Error(`Socket server not initlized...`);
  	}
  	const chatRoom = defaultContainer.getNamed<AbstractSocketHandler>(InjectorCodes.ABS_SOCKET_HANDLER, InjectorCodes.CHAT_ROOM_HANDLER);
  	this.registerNamespace(chatRoom);

  	if (defConf.ENABLE_CACHE) {
  		LOGGER.info(`[AppWebSocket] Enable cache`);
  		this._server.adapter(ioAdapter.createAdapter(defConf.DEFAULT_REDIS.URI));
  	}

  	return this;
  }

  close = (): void => {
  	LOGGER.info('Close socket server...');
  	this._server?.close();
  }
}