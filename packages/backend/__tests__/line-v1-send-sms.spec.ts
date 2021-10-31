import * as superTest from 'supertest';
import * as util from 'util';
import { mock } from 'jest-mock-extended';
import {
	CustomError,
	CustomUtils,
	defaultContainer,
	IMongooseClient,
	commonInjectorCodes,
	ErrorCodes,
	HttpCodes,
	ICustomHttpClient,
	CustomResult,
	ISMSClient,
} from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { ErrorCodes as domainErr } from '../src/domain/enums/error-codes';
import { CodeEntity } from '../src/domain/entities/code-entity';
import { ICodeRepository } from '../src/domain/repositories/i-code-repository';

const _ENDPOINT = '/line_io/api/v1/codes/%s';

describe('Line io send SMS spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let db: IMongooseClient;
	let codeRepo: ICodeRepository;
	beforeAll(async () => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		codeRepo = defaultContainer.get(InjectorCodes.I_CODE_REPO);

		const smsClient = mock<ISMSClient>();
		smsClient.tryConnect.mockResolvedValue();
		smsClient.send.mockResolvedValue(true);
		defaultContainer.rebind<ISMSClient>(commonInjectorCodes.I_SMS_CLIENT).toConstantValue(smsClient);
	});
	afterAll(async () => {
		await db.clearData();
		await db.close();
	});
	describe('Required fields', () => {
		test('[10001] Parameter "phone" has worng format', async () => {
			const endpoint = util.format(_ENDPOINT, '096773');
			const res = await agentClient
				.put(endpoint);

			const err = new CustomError(domainErr.ERR_PHONE_FORMAT_WRONG);
			expect(res.status).toBe(err.httpStatus);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: err.code,
				message: err.message,
			});
		});
	});
	describe('Success', () => {
		let existPhone: CodeEntity;
		beforeAll(async () => {
			existPhone = new CodeEntity();
			existPhone.phone = '0987654322';
			existPhone.refesh('1234');
			existPhone = await codeRepo.save(existPhone) as CodeEntity;

		});
		test('success w/o existed phone', async () => {
			const p = '0987654321';
			const endpoint = util.format(_ENDPOINT, p);
			const res = await agentClient
				.put(endpoint);
      
			expect(res.status).toBe(200);
			const c = await codeRepo.findOneByPhone(p) as CodeEntity;
			expect(c).toBeTruthy();
			expect(c.code).toHaveLength(4);
			expect(c.hasExpired()).toBe(false);
		});
		test('success w/ existed phone', async () => {
			const endpoint = util.format(_ENDPOINT, existPhone.phone);
			const res = await agentClient
				.put(endpoint);
      
			expect(res.status).toBe(200);
			const c = await codeRepo.findOneByPhone(existPhone.phone) as CodeEntity;
			expect(c).toBeTruthy();
			expect(c.code).toHaveLength(4);
			expect(c.code).not.toBe(existPhone.code);
			expect(c.hasExpired()).toBe(false);
		});
	});
});
