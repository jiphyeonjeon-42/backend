export default class ErrorResponse extends Error {
  status: number;

  errorCode: number;

  constructor(...args: [errorCode: number, status: number, messages?: string]) {
    super(args[2]);
    [this.errorCode, this.status] = args;
  }
}
