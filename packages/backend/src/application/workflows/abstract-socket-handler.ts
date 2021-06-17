import { injectable } from 'inversify';
import { Socket, Namespace } from 'socket.io';
import { CustomError, ICodeObject, TNullable } from '@demo/app-common';

@injectable()
export abstract class AbstractSocketHandler {
    public rootServer: TNullable<Socket> = null;
    public path: string = '';

    constructor(namespace = '') {
    	this.path = `/wss/v1/${namespace}`;
    }

    makeError(err: any): ICodeObject {
    	return CustomError.getCode(err.type);
    }

    abstract onConnection(socket: Socket): void;
    abstract onAuthorize(socket: Socket, next: (err?: Error) => void): Promise<void>;
}