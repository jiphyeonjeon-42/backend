export default class ErrorResponse extends Error {
  errorCode: string;

  status: number;

  constructor(...args: [errorCode: string, status: number, messages?: string]) {
    super(args[2]);
    [this.errorCode, this.status] = args;
  }
}
