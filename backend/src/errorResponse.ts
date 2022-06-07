export default class ErrorResponse extends Error {
  status: number;

  errorCode: number;

  constructor(...args: [status: number, errorCode: number, messages?: string]) {
    super(args[2]);
    [this.status, this.errorCode] = args;
  }
}
