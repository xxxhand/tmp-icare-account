interface IBaseResponse {
  success: boolean;
}

export interface IAccountExistResponse extends IBaseResponse {
  data: {
    accountExists: boolean
  };
}
