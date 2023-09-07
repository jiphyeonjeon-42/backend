import { NextFunction, Request, Response } from 'express';
import * as Status from 'http-status';
import { logger } from '~/logger';
import * as errorCode from './errorCode';
import ErrorResponse from './errorResponse';

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
      errorCode.UNKNOWN_ERROR,
      Status.INTERNAL_SERVER_ERROR,
      '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    );
  } else error = err as ErrorResponse;
  if (parseInt(error.errorCode, 10) === 42) {
    res.status(error.status).json({
      errorCode: parseInt(error.errorCode, 10),
      message: '42키값 업데이트가 필요합니다. 키값 업데이트까지는 일반 로그인을 이용해주세요.',
    });
  }
  res.status(error.status).json({ errorCode: parseInt(error.errorCode, 10) });
}
