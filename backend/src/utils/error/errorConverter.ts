import { NextFunction, Request, Response } from 'express';
import * as Status from 'http-status';
import ErrorResponse from './errorResponse';
import { logger } from '../logger';
import * as errorCode from './errorCode';

export default function errorConverter(
  err: Error | ErrorResponse,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  next: NextFunction,
) {
  if (err.message == errorCode.CLIENT_AUTH_FAILED_ERROR_MESSAGE) { 
    return next(new ErrorResponse('42', 500, '42KeyError'));
  }
  next(err);
};
