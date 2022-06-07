import { NextFunction, Request, Response } from 'express';
import * as Status from 'http-status';
import ErrorResponse from './errorResponse';
import { logger } from './utils/logger';

export default function errorHandler(
  err: Error | ErrorResponse,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  next: NextFunction,
) {
  let error: ErrorResponse;
  if (!(err instanceof ErrorResponse)) {
    logger.error(err);
    error = new ErrorResponse(
      err.message === 'DB error' ? 1 : 0,
      Status.INTERNAL_SERVER_ERROR,
      '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    );
  } else error = err as ErrorResponse;
  res.status(error.status).json({ errorCode: error.errorCode });
}
