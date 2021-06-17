
import { ICodeObject } from '../custom-types';

export class CustomResult<T = any> {
  public traceId: string = '';
  public code: number = 0;
  public message: string = '';
  public result?: T = undefined;

  public isOK(): boolean {
  	return this.code === 0;
  }

  public withTraceId(traceId: string): this {
  	this.traceId = traceId;
  	return this;
  }

  public withCode(code: number): this {
  	this.code = code;
  	return this;
  }

  public withMessage(message: string): this {
  	this.message = message;
  	return this;
  }

  public withResult(result?: T) : this {
  	this.result = result;
  	return this;
  }

  public withErrorCode(obj: ICodeObject): this {
  	this.code = obj.code;
  	this.message = obj.message;
  	this.result = undefined;
  	return this;
  }
}
