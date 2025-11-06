export interface IResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface IError {
  code: number;
  data: {
    error: string;
  }[];
  message: string;
}
