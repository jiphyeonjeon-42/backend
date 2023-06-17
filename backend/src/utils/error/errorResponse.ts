export default class ErrorResponse extends Error {
  constructor(
    public readonly errorCode: string,
    public readonly status: number,
    messages?: string,
  ) {
    super(messages);
  }
}
