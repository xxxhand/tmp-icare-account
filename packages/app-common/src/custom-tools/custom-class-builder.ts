import 'reflect-metadata';
import { TNullable } from '../custom-types';
import { getJsonProperty, getClazz } from '../custom-tools/custom-decorators/custom-json-prop';

function _isPrimitive(obj: any): boolean {
	switch (typeof obj) {
		case 'string':
		case 'boolean':
		case 'number':
			return true;
	}
	return !!(obj instanceof String || obj === String ||
		obj instanceof Number || obj === Number ||
		obj instanceof Boolean || obj === Boolean);
}

function _isArray(obj: any) {
	if (obj === Array) {
		return true;
	} else if (typeof Array.isArray === "function") {
		return Array.isArray(obj);
	}
	return !!(obj instanceof Array);
}

export class CustomClassBuilder {
	static build<T>(clazz?: { new(): T }, source?: any): TNullable<T> {
		if (!clazz || !source) {
			return undefined;
		}
		let obj = new clazz();
		for (const key of Object.keys(obj)) {
			let prop = getJsonProperty<T>(obj, key);
			if (!prop) {
				if (source[key] !== void 0) {
					obj[key as keyof T] = source[key];
				}
				continue;
			}
			let name = prop.name || key;
			let innerJson = source ? source[name] : undefined;
			let tClazz = getClazz(obj, key);
			let val = source ? source[name] : undefined;

			if (_isArray(tClazz)) {
				let metadata = getJsonProperty(obj, key);
				if (metadata.clazz || _isPrimitive(tClazz)) {
					if (innerJson && _isArray(innerJson)) {
						val = innerJson.map((item: any) => CustomClassBuilder.build(metadata.clazz, item));
					}
				}
			} else if (!_isPrimitive(tClazz)) {
				val = CustomClassBuilder.build(tClazz, innerJson);
			}
			if (val === void 0) {
				continue;
			}
			obj[key as keyof T] = val;
		}
		return obj;
	}
}