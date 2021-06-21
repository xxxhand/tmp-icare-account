import { logger } from './custom-tools/custom-logger';

export { ErrorCodes } from './custom-codes/error-codes';
export { HttpCodes } from './custom-codes/http-codes';
export { CustomError } from './custom-models/custom-error';
export { CustomResult } from './custom-models/custom-result';
export { CustomHttpOption } from './custom-models/custom-http-option';
export { customArgvs } from './custom-tools/custom-argvs';
export { getId as getTraceId, defaultNameSpace } from './custom-tools/custom-request-tracer';
export { CustomUtils } from './custom-tools/custom-utils';
export { validateStrategy, CustomValidator } from './custom-tools/custom-validator';
export {
	TNullable,
	ICodeObject,
	IMongooseClient,
	IBaseRequest,
	ICustomHttpClient,
	ICustomRedisClient,
} from './custom-types';
export { defaultContainer, lazyInject, lazyInjectNamed } from './shared/default-container';
export { CustomMongooseClient } from './custom-tools/custom-mongoose-client';
export { CustomRedisClient } from './custom-tools/custom-redis-client';
export { CustomClassBuilder } from './custom-tools/custom-class-builder';
export { CustomHttpClient } from './custom-tools/custom-http-client';
export { CustomJsonProp } from './custom-tools/custom-decorators/custom-json-prop';
export { commonInjectorCodes } from './shared/default-mapping-codes';
export { defaultConfig as defConf } from './shared/default-config';
export const LOGGER = logger;
