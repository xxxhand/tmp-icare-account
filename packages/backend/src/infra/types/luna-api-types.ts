interface IBaseResponse {
  success: boolean;
  errors?: any;
}

export interface IAccountExistResponse extends IBaseResponse {
  data: {
    accountExists: boolean
  };
}

export interface ILoginLunaUser {
  name: string;
  photo: string;
  birthDate: Date;
  mobile: string;
  personalId: string;
  gender: number;
}

interface ILunaLoginData {
  user: ILoginLunaUser;
  redirectURL: string;
  token: string;
}

export interface ILunaLoginResult extends IBaseResponse {
  data?: ILoginLunaUser;
}