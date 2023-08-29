import { NextFunction, Request, Response } from 'express';
import { logger } from '~/logger';
import * as errorCode from '~/v1/utils/error/errorCode';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as status from 'http-status';
import * as searchKeywordsService from './search-keywords.service';

export const getPopularSearchKeywords = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const items = await searchKeywordsService.getPopularSearchKeywords();
    return res.status(status.OK).json({ items });
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      return next(new ErrorResponse(error.message, status.BAD_REQUEST));
    }
    if (error.message === 'DB error') {
      return next(
        new ErrorResponse(
          errorCode.QUERY_EXECUTION_FAILED,
          status.INTERNAL_SERVER_ERROR,
        ),
      );
    }
    logger.error(error);
    return next(
      new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR),
    );
  }
};
