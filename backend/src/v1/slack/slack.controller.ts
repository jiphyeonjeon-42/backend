import { NextFunction, Request, Response } from 'express';
import * as status from 'http-status';
import * as slack from './slack.service';
import * as errorCode from '../utils/error/errorCode';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';

export const updateSlackList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) : Promise<void> => {
  try {
    await slack.updateSlackId();
    res.status(204).send();
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 400 && errorNumber < 500) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  }
};

export const black = '';
