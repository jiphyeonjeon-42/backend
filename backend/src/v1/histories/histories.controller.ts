import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import { logger } from '~/logger';
import * as errorCode from '~/v1/utils/error/errorCode';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as historiesService from './histories.service';

// eslint-disable-next-line import/prefer-default-export
export const histories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const query = String(req.query.query) !== 'undefined' ? String(req.query.query) : '';
  const who = String(req.query.who) !== 'undefined' ? String(req.query.who) : '';
  const page = parseInt(req.query.page as string, 10) ? parseInt(req.query.page as string, 10) : 0;
  // eslint-disable-next-line max-len
  const limit = parseInt(req.query.limit as string, 10) ? parseInt(req.query.limit as string, 10) : 5;
  const type = String(req.query.type) !== 'undefined' ? String(req.query.type) : 'all';
  const { id: userId, role: userRole } = req.user as any;

  if (Number.isNaN(page) || Number.isNaN(limit)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  if (!(who === 'all' || who === 'my')) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  // 사서 권한 확인
  if (who === 'all' && userRole !== 2) {
    return next(new ErrorResponse(errorCode.UNAUTHORIZED, status.UNAUTHORIZED));
  }
  try {
    const result = await historiesService.getHistories(query, who, userId, type, page, limit);
    return res.status(status.OK).json(result);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 700 && errorNumber < 800) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};
