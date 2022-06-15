import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as errorCode from '../errorCode';
import ErrorResponse from '../errorResponse';
import { logger } from '../utils/logger';
import * as lendingsService from './lendings.service';

export const create: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.user as any;
  if (!req.body.userId || !req.body.bookId) {
    next(new ErrorResponse(errorCode.badRequest, status.BAD_REQUEST));
  }
  try {
    await lendingsService.create(
      req.body.userId,
      req.body.bookId,
      id,
      req.body.condition,
    );
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 400 && errorNumber < 500) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.queryExecutionFailed, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(errorCode.unknownError, status.INTERNAL_SERVER_ERROR));
    }
  }
};

const argumentCheck = (sort:string, type:string) => {
  if (sort !== 'new' && sort !== 'old') { return 0; }
  if (type !== 'user' && type !== 'title' && type !== 'callSign' && type !== 'all') { return 0; }
  return 1;
};

export const search: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const info = req.query;
  const query = info.query as string;
  const page = parseInt(info.page as string, 10) ? parseInt(info.page as string, 10) : 0;
  const limit = parseInt(info.limit as string, 10) ? parseInt(info.limit as string, 10) : 5;
  const sort = info.sort as string;
  const type = info.type as string ? info.type as string : 'all';
  if (!argumentCheck(sort, type)) {
    return next(new ErrorResponse(errorCode.badRequest, status.BAD_REQUEST));
  }
  try {
    const result = await lendingsService.search(query, page, limit, sort, type);
    res.status(status.OK).json(result);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 400 && errorNumber < 500) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.queryExecutionFailed, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(errorCode.unknownError, status.INTERNAL_SERVER_ERROR));
    }
  }
  return 0;
};

export const lendingId: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return next(new ErrorResponse(errorCode.badRequest, status.BAD_REQUEST));
  }
  try {
    await lendingsService.lendingId(id);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 400 && errorNumber < 500) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.queryExecutionFailed, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(errorCode.unknownError, status.INTERNAL_SERVER_ERROR));
    }
  }
  return 0;
};

export const returnBook: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.user as any;
  if (!req.body.lendingId || !req.body.condition) {
    return next(new ErrorResponse(errorCode.invalidInput, status.BAD_REQUEST));
  }
  try {
    await lendingsService.returnBook(
      id,
      req.body.lendingId,
      req.body.condition,
    );
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 400 && errorNumber < 500) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.queryExecutionFailed, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(errorCode.unknownError, status.INTERNAL_SERVER_ERROR));
    }
  }
  return 0;
};
