import * as cls from 'cls-hooked';
import * as uuid from 'uuid';

const _REQUEST_ID: string = 'requestId';
const _nameSpaceId = `tracer:${uuid.v4()}`;
const _nameSpace = cls.createNamespace(_nameSpaceId);

export const getId = (): string => {
	if (_nameSpace && _nameSpace.active) {
		return _nameSpace.get(_REQUEST_ID);
	}
	return '';
};

export const defaultNameSpace = _nameSpace;