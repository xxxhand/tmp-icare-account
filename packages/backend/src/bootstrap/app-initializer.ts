import {
	defConf,
	LOGGER,
	defaultContainer,
	CustomMongooseClient,
	IMongooseClient,
	commonInjectorCodes,
	ICustomHttpClient,
	CustomHttpClient,
	ICustomRedisClient,
	CustomRedisClient,
} from '@demo/app-common';
import { InjectorCodes } from '../domain/enums/injector-codes';
import { AbstractSocketHandler } from '../application/workflows/abstract-socket-handler';
import { ChatRoomHandler } from '../application/workflows/chat-room-handler';
import * as defaultOrm from '../infra/orm-models';
import { IClientRepository } from '../domain/repositories/i-client-repository';
import { ClientRepository } from '../infra/repositories/client-repository';
import { IChatRoomRepository } from '../domain/repositories/i-chat-room-repository';
import { ChatRoomRepository } from '../infra/repositories/chat-room-repository';
import { ITokenRepository } from '../domain/repositories/i-token-repository';
import { TokenRepository } from '../infra/repositories/token-repository';

export class AppInitializer {

	static async tryDbClient(): Promise<void> {
		const defMongo = defConf.DEFAULT_MONGO;
		const client = new CustomMongooseClient(defMongo.URI, {
			user: defMongo.USER,
			pass: defMongo.PASS,
			poolSize: defMongo.POOL_SIZE,
			dbName: defMongo.DB_NAME,
		});
		client.ignoreClearEnvironments('production', 'prod');
		await client.tryConnect();
		// Load all orm models
		LOGGER.info('Load all models');
		defaultOrm.load(client);
		defaultContainer
			.bind<IMongooseClient>(commonInjectorCodes.I_MONGOOSE_CLIENT)
			.toConstantValue(client)
			.whenTargetNamed(commonInjectorCodes.DEFAULT_MONGO_CLIENT);

	}

	static async tryRedis(): Promise<void> {
		const redisClient = new CustomRedisClient();
		if (defConf.ENABLE_CACHE) {
			await redisClient.tryConnect({
				host: defConf.DEFAULT_REDIS.HOST,
				port: defConf.DEFAULT_REDIS.PORT,
				password: defConf.DEFAULT_REDIS.PASS,
				db: defConf.DEFAULT_REDIS.DB_NAME,
			});
		}
		defaultContainer
			.bind<ICustomRedisClient>(commonInjectorCodes.I_REDIS_CLIENT)
			.toConstantValue(redisClient)
			.whenTargetNamed(commonInjectorCodes.DEFAULT_REDIS_CLIENT);
	}

	static tryInjector(): void {

		/** tools */
		defaultContainer
			.bind<ICustomHttpClient>(commonInjectorCodes.I_HTTP_CLIENT)
			.to(CustomHttpClient)
			.inSingletonScope();

		/** repositories */
		defaultContainer
			.bind<IClientRepository>(InjectorCodes.I_CLIENT_REPO).to(ClientRepository).inSingletonScope();
		defaultContainer
			.bind<IChatRoomRepository>(InjectorCodes.I_CHAT_ROOM_REPO).to(ChatRoomRepository).inSingletonScope();
		defaultContainer
			.bind<ITokenRepository>(InjectorCodes.I_TOKEN_REPO).to(TokenRepository).inSingletonScope();

		/** socket handlers */
		defaultContainer
			.bind<AbstractSocketHandler>(InjectorCodes.ABS_SOCKET_HANDLER)
			.to(ChatRoomHandler)
			.whenTargetNamed(InjectorCodes.CHAT_ROOM_HANDLER);
	}

}
