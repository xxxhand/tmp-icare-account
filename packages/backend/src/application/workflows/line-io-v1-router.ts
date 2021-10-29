import { Router } from 'express';
import { CodeController } from './code-controller';

export class LineIOV1Router {
  public prefix: string = '/line_io/api/v1';
  public router: Router = Router();

  constructor() {
  	this._init();
  }

  private _init = (): void => {
  	this.router
  		.use(CodeController.build());
  }
}
