import 'reflect-metadata';

export const customPropKey = 'customPropKey';

export interface IPropMetadata<T> {
  name?: string;
  clazz?: { new(): T }
}

export function CustomJsonProp<T>(metadata?: IPropMetadata<T> | string): any {
	if (metadata instanceof String || typeof metadata === 'string') {
		return Reflect.metadata(customPropKey, <IPropMetadata<T>>{
			name: metadata,
			clazz: undefined,
		});
	}
	return Reflect.metadata(customPropKey, metadata);
}

export function getJsonProperty<T>(target: any, propertyKey: string): IPropMetadata<T> {
	return Reflect.getMetadata(customPropKey, target, propertyKey) as IPropMetadata<T>;
}

export function getClazz(target: any, propertyKey: string): any {
	return Reflect.getMetadata('design:type', target, propertyKey);
}