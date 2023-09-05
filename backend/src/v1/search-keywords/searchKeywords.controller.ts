import { NextFunction, Request, Response } from 'express';

import { logger } from '~/logger';
import * as errorCode from '~/v1/utils/error/errorCode';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as status from 'http-status';
import * as searchKeywordsService from './searchKeywords.service';

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

export const searchKeywordsAutocomplete = async (
  req: Request,
  res: Response,
  next: NextFunction,
) : Promise<Response | void> => {
  let {
    keyword,
  } = req.query;
  if (typeof keyword === 'string') {
    keyword = keyword.trim();
  }
  if (!keyword) {
    return res.status(status.OK).send({
      items: [],
      meta: {totalCount: 0},
    });
  }
  try {
    const items = await searchKeywordsService.getSearchAutocompletePreviewResult(keyword as string);
    return res.status(status.OK).send(items);
  } catch (error) {
    return next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
};
