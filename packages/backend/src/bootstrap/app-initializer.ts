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
	ISMSClient,
	CustomSMSClient,
	ILineClient,
	CustomLineClient,
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
import { IAccountRepository } from '../domain/repositories/i-account-repository';
import { AccountRepository } from '../infra/repositories/account-repository';
import { ILunaRepository } from '../domain/repositories/i-luna-repository';
import { LunaRepository } from '../infra/repositories/luna-repository';
import { IAccountService } from '../application/services/interfaces/i-account-service';
import { AccountService } from '../application/services/account-service';
import { ICodeRepository } from '../domain/repositories/i-code-repository';
import { CodeRepository } from '../infra/repositories/code-repository';
import { LunaHttpClient } from '../infra/tools/luna-http-client';
import { INotifyservice } from '../infra/services/interfaces/i-notify-service';
import { NotifyService  } from '../infra/services/notify-service';

export class AppInitializer {

	static async tryDbClient(): Promise<void> {
		const defMongo = defConf.DEFAULT_MONGO;
		const client = new CustomMongooseClient(defMongo.URI, {
			user: defMongo.USER,
			pass: defMongo.PASS,
			maxPoolSize: defMongo.POOL_SIZE,
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

		//#region Custom tools
		defaultContainer
			.bind<ICustomHttpClient>(commonInjectorCodes.I_HTTP_CLIENT)
			.toConstantValue(new CustomHttpClient())
			.whenTargetNamed(commonInjectorCodes.DEFAULT_HTTP_CLIENT);
		
		defaultContainer
			.bind<ICustomHttpClient>(commonInjectorCodes.I_HTTP_CLIENT)
			.toConstantValue(new LunaHttpClient())
			.whenTargetNamed(InjectorCodes.LUNA_HTTP_CLIENT);

		const smsClient = new CustomSMSClient({
			host: defConf.DEFAULT_SMS.HOST,
			port: defConf.DEFAULT_SMS.PORT,
			account: defConf.DEFAULT_SMS.ACCOUNT,
			password: defConf.DEFAULT_SMS.PASSWORD,
			maxTryLimit: 3,
		});
		defaultContainer
			.bind<ISMSClient>(commonInjectorCodes.I_SMS_CLIENT)
			.toConstantValue(smsClient);

		
		const lineClient = new CustomLineClient({
			channelAccessToken: defConf.DEFAULT_LINE.ACCESS_TOKEN,
			channelSecret: defConf.DEFAULT_LINE.SECRET,
		}, Object.values(defConf.DEFAULT_LINE.RICH_MENUS));
		defaultContainer
			.bind<ILineClient>(commonInjectorCodes.I_LINE_CLIENT)
			.toConstantValue(lineClient)
			.whenTargetNamed(commonInjectorCodes.DEFAULT_LINE_CLIENT);

		//#endregion
		
		//#region repositories
		defaultContainer
			.bind<IClientRepository>(InjectorCodes.I_CLIENT_REPO).to(ClientRepository).inSingletonScope();
		defaultContainer
			.bind<IChatRoomRepository>(InjectorCodes.I_CHAT_ROOM_REPO).to(ChatRoomRepository).inSingletonScope();
		defaultContainer
			.bind<ITokenRepository>(InjectorCodes.I_TOKEN_REPO).to(TokenRepository).inSingletonScope();
		defaultContainer
			.bind<IAccountRepository>(InjectorCodes.I_ACCOUNT_REPO).to(AccountRepository).inSingletonScope();
		defaultContainer
			.bind<ILunaRepository>(InjectorCodes.I_LUNA_REPO).to(LunaRepository).inSingletonScope();
		defaultContainer
			.bind<ICodeRepository>(InjectorCodes.I_CODE_REPO).to(CodeRepository).inSingletonScope();

		//#endregion

		//#region infra services
		defaultContainer
			.bind<INotifyservice>(InjectorCodes.I_NOFIFY_SRV).to(NotifyService).inSingletonScope();
		//#endregion

		//#region application services
		defaultContainer
			.bind<IAccountService>(InjectorCodes.I_ACCOUNT_SRV).to(AccountService).inSingletonScope();

		//#endregion

		//#region socket handlers 
		defaultContainer
			.bind<AbstractSocketHandler>(InjectorCodes.ABS_SOCKET_HANDLER)
			.to(ChatRoomHandler)
			.whenTargetNamed(InjectorCodes.CHAT_ROOM_HANDLER);
		
		//#endregion
	}

}
