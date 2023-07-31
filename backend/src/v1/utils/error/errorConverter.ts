import { NextFunction, Request, Response } from 'express';
import * as errorCode from './errorCode';
import ErrorResponse from './errorResponse';

export default function errorConverter(
  err: Error | ErrorResponse,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  next: NextFunction,
) {
  if (err.message === errorCode.CLIENT_AUTH_FAILED_ERROR_MESSAGE) {
    return next(new ErrorResponse('42', 500, '42KeyError'));
  }
  next(err);
}
