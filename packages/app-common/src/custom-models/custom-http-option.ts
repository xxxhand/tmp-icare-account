export class CustomHttpOption {
  private _uri: string = '';
  private _timeout: number = 0;
  private _headers: Map<string, any> = new Map();
  private _params: Map<string, any> = new Map();
  private _attachs: Map<string, any> = new Map();

  public get uri(): string {
  	return this._uri;
  }

  public get timeout(): number {
  	return this._timeout;
  }

  public get headers(): Map<string, any> {
  	return this._headers;
  }

  public get parameters(): Map<string, any> {
  	return this._params;
  }

  public get attachements(): Map<string, any> {
  	return this._attachs;
  }

  public setUrl(url: string = ''): CustomHttpOption {
  	this._uri = url;
  	return this;
  }

  public setTimeout(seconds: number = 0): CustomHttpOption {
  	this._timeout = seconds * 1000;
  	return this;
  }

  public addHeader(key: string, val: any): CustomHttpOption {
  	this._headers.set(key, val);
  	return this;
  }

  public addParameter(key: string, val: any): CustomHttpOption {
  	this._params.set(key, val);
  	return this;
  }

  public addAttachement(key: string, val: any): CustomHttpOption {
  	this._attachs.set(key, val);
  	return this;
  }
}
