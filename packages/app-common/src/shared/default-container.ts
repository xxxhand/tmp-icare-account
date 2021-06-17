import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';


const defaultContainer = new Container({ defaultScope: 'Singleton' });
const { lazyInject, lazyInjectNamed }  = getDecorators(defaultContainer);

export {
	defaultContainer,
	lazyInject,
	lazyInjectNamed,
};
