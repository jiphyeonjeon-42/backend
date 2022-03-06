import { NextFunction, Request, Response } from 'express';
import * as Status from 'http-status';
import ErrorResponse from './errorResponse';

export default function errorHandler(
  err: Error | ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let error: ErrorResponse;
  if (!(err instanceof ErrorResponse)) {
    console.log(err);
    error = new ErrorResponse(
      Status.INTERNAL_SERVER_ERROR,
      '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    );
  } else error = err as ErrorResponse;
  res.status(error.status).json(error.message);
}
