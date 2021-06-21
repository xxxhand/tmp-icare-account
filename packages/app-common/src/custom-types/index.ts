import { Model, Schema, Document } from 'mongoose';
import { MongoClient } from 'mongodb';
import { Redis } from 'ioredis';
import { CustomHttpOption } from '../custom-models/custom-http-option';
import { CustomResult } from '../custom-models/custom-result';

export interface ICodeObject {
	alias: string,
	code: number,
	httpStatus: number,
	message: string
};

export type TNullable<T> = T | undefined | null;

export interface IBaseRequest<T> {
	checkRequired(): T;
}

export interface IMongooseClient {
	ignoreClearEnvironments(...env: Array<string>): void;
	isConnected(): boolean;
	tryConnect(): Promise<void>;
	registerModel<T extends Document>(name: string, schema: Schema): TNullable<Model<T>>;
	getModel<T extends Document>(name: string): Model<T>;
	clearData(): Promise<void>;
	close(): Promise<void>;
	getNativeClient(): MongoClient;
}

export interface ICustomHttpClient {
	tryPostJson(option: TNullable<CustomHttpOption>): Promise<CustomResult>;
	tryPostForm(option: TNullable<CustomHttpOption>): Promise<CustomResult>;
	tryGet(option: TNullable<CustomHttpOption>): Promise<CustomResult>;
}

export interface ICustomRedisClient {
	open(): Redis;
	close(): void;
	isConnected(): boolean;
}
