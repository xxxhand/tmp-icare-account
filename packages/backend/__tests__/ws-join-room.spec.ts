import { AddressInfo } from 'net';
import * as http from 'http';
import * as util from 'util';
import pEvent from 'p-event';
import { io, Socket } from 'socket.io-client';
import { mock } from 'jest-mock-extended';
import {
	CustomUtils,
	CustomError,
	ErrorCodes as cmmErr,
	defaultContainer,
	IMongooseClient,
	commonInjectorCodes,
	ICustomHttpClient,
	CustomResult,
} from '@demo/app-common';
import { RoomEvents } from '../src/domain/enums/room-event-codes';
import { AppWebSocket } from '../src/bootstrap/app-web-socket';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { ErrorCodes } from '../src/domain/enums/error-codes';
import { RoomStatusCodes } from '../src/domain/enums/room-status-codes';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { IChatRoomRepository } from '../src/domain/repositories/i-chat-room-repository';
import { ChatRoomEntity } from '../src/domain/entities/chat-room-entity';
import { TokenEntity } from '../src/domain/entities/token-entity';
import { ITokenRepository } from '../src/domain/repositories/i-token-repository';
import { ClientEntity } from '../src/domain/entities/client-entity';
import { IClientRepository } from '../src/domain/repositories/i-client-repository';

let _ENDPOINT = 'http://localhost:%d/wss/v1/chat-room';
interface IBody {
	chatRoomId: string;
	userId: string;
	userName: string;
};

describe('Join room spec', () => {
	let clientSocket: Socket;
	let socketServer: AppWebSocket;
	let roomRepo: IChatRoomRepository;
	let room: ChatRoomEntity;
	let db: IMongooseClient;
	let mockToken: TokenEntity;
	let tokenRepo: ITokenRepository;
	let mockClient: ClientEntity;
	let clientRepo: IClientRepository;
	const defBody: IBody = {
		chatRoomId: '',
		userId: 'xxxhand',
		userName: 'xxxhand',
	};
	beforeAll(async (done) => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();

		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		const httpServer = http.createServer();
		socketServer = new AppWebSocket()
			.useHttpServer(httpServer)
			.loadNamespaces();

		httpServer.listen();
		await pEvent(httpServer, 'listening');
		const addr = <AddressInfo>httpServer.address();

		roomRepo = defaultContainer.get(InjectorCodes.I_CHAT_ROOM_REPO);
		clientRepo = defaultContainer.get(InjectorCodes.I_CLIENT_REPO);
		tokenRepo = defaultContainer.get(InjectorCodes.I_TOKEN_REPO);

		room = new ChatRoomEntity();
		room.hostId = '604afe61e4a7e6bfdaf01f9f';
		room.openedAt = new Date();
		room = await roomRepo.save(room) as ChatRoomEntity;

		mockClient = new ClientEntity();
		mockClient.name = 'xxxhand-test';
		mockClient.clientSecret = CustomUtils.generateUniqueId();
		mockClient.clientId = CustomUtils.generateUniqueId();
		mockClient.callbackUrl = 'http://aaa.bbb.com';
		mockClient = await clientRepo.save(mockClient) as ClientEntity;

		mockToken = new TokenEntity();
		mockToken.clientId = mockClient.clientId;
		mockToken.token = CustomUtils.generateUniqueId();
		mockToken.expiredAt = Date.now() + (60 * 60 * 1 * 1000);
		mockToken = await tokenRepo.save(mockToken) as TokenEntity;

		defBody.chatRoomId = room.chatRoomId;

		// Mock http client
		const httpClient = mock<ICustomHttpClient>();
		httpClient.tryGet.mockResolvedValue(new CustomResult());
		defaultContainer.rebind<ICustomHttpClient>(commonInjectorCodes.I_HTTP_CLIENT).toConstantValue(httpClient);

		_ENDPOINT = util.format(_ENDPOINT, addr.port);
		clientSocket = io(_ENDPOINT, {
			query: {
				id: defBody.userId,
				token: mockToken.token,
			},
		});
		await pEvent(clientSocket, 'connect');
		
		done();
	});
	afterAll(async (done) => {
		await db.clearData();
		await db.close();
		clientSocket.close();
		socketServer.close();
		done();
	});
	describe('Required fields', () => {
		test('[1002] Parameter "chatRoomId" is empty', async (done) => {
			const b = CustomUtils.deepClone<IBody>(defBody);
			b.chatRoomId = '';
			clientSocket.emit(RoomEvents.JOIN_ROOM, b);
			const err = CustomError.getCode(ErrorCodes.CHAT_ROOM_ID_INVALID);
			const msg = await pEvent(clientSocket, RoomEvents.JOIN_ROOM_RES);
			expect(msg).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
			done();
		});
		test('[1003] Parameter "userId" is empty', async (done) => {
			const b = CustomUtils.deepClone<IBody>(defBody);
			b.userId = '';
			clientSocket.emit(RoomEvents.JOIN_ROOM, b);
			const err = CustomError.getCode(ErrorCodes.CLIENT_USER_ID_INVALID);
			const msg = await pEvent(clientSocket, RoomEvents.JOIN_ROOM_RES);
			expect(msg).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
			done();
		});
		test('[1004] Parameter "userName" is empty', async (done) => {
			const b = CustomUtils.deepClone<IBody>(defBody);
			b.userName = '';
			clientSocket.emit(RoomEvents.JOIN_ROOM, b);
			const err = CustomError.getCode(ErrorCodes.CLIENT_USER_NAME_INVALID);
			const msg = await pEvent(clientSocket, RoomEvents.JOIN_ROOM_RES);
			expect(msg).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
			done();
		});
	});
	describe('Validation rules', () => {
		let closedRoom: ChatRoomEntity;
		beforeAll(async (done) => {
			closedRoom = new ChatRoomEntity();
			closedRoom.hostId = '604afe61e4a7e6bfdaf01f9f';
			closedRoom.openedAt = new Date();
			closedRoom.status = RoomStatusCodes.CLOSE;
			closedRoom = await roomRepo.save(closedRoom) as ChatRoomEntity;

			done();
		});
		test('[90005] Validation fail', async (done) => {
			const failClient = io(_ENDPOINT, {
				query: {
					id: 'kkkTest',
					token: '',
				},
			});
			const msg = await pEvent(failClient, 'connect_error');
			const err = CustomError.getCode(cmmErr.ERR_UN_AUTH);
			expect(msg.message).toBe(err.message);

			failClient.close();
			done();
		});
		test('[1001] Invalid room', async (done) => {
			const b = CustomUtils.deepClone<IBody>(defBody);
			b.chatRoomId = '604afe61e4a7e6bfdaf01fa0';
			clientSocket.emit(RoomEvents.JOIN_ROOM, b);
			const err = CustomError.getCode(ErrorCodes.NOT_EXIST_CHAT_ROOM);
			const msg = await pEvent(clientSocket, RoomEvents.JOIN_ROOM_RES);
			expect(msg).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
			done();
		});
		test('[1011] Room is not opened', async (done) => {
			const b = CustomUtils.deepClone<IBody>(defBody);
			b.chatRoomId = closedRoom.chatRoomId;
			clientSocket.emit(RoomEvents.JOIN_ROOM, b);
			const err = CustomError.getCode(ErrorCodes.CHAT_ROOM_IS_CLOSE);
			const msg = await pEvent(clientSocket, RoomEvents.JOIN_ROOM_RES);
			expect(msg).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
			done();
		});
	});
	describe('Success', () => {
		test.skip('[Success]', async (done) => {
			clientSocket.emit(RoomEvents.JOIN_ROOM, defBody);
			const msg = await pEvent(clientSocket, RoomEvents.JOIN_ROOM_RES);
			expect(msg.result).toBeTruthy();
			expect(msg).toEqual({
				traceId: expect.any(String),
				code: 0,
				message: '',
				result: defBody,
			});
			done();
		});
		test.todo('[Success] Duplicate join');
	});
});
