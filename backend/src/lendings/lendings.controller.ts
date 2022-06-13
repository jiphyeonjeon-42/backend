import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import ErrorResponse from '../errorResponse';
import { logger } from '../utils/logger';
import * as lendingsService from './lendings.service';
import { badRequest } from './lendings.service';

export const create: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.user as any;
  if (!req.body.userId || !req.body.bookId) {
    next(new ErrorResponse(parseInt(badRequest, 10), status.BAD_REQUEST));
  }
  try {
    await lendingsService.create(
      req.body.userId,
      req.body.bookId,
      id,
      req.body.condition,
    );
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 400 && errorCode < 500) {
      next(new ErrorResponse(errorCode, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
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
  const page = parseInt(info.page as string, 10) ? parseInt(info.page as string, 10) - 1 : 0;
  const limit = parseInt(info.limit as string, 10) ? parseInt(info.limit as string, 10) : 5;
  const sort = info.sort as string;
  const type = info.type as string ? info.type as string : 'all';
  if (!argumentCheck(sort, type)) {
    next(new ErrorResponse(parseInt(badRequest, 10), status.BAD_REQUEST));
  }
  try {
    const result = await lendingsService.search(query, page, limit, sort, type);
    res.status(status.OK).json(result);
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 400 && errorCode < 500) {
      next(new ErrorResponse(errorCode, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
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
    next(new ErrorResponse(parseInt(badRequest, 10), status.BAD_REQUEST));
  }
  try {
    await lendingsService.lendingId(id);
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 400 && errorCode < 500) {
      next(new ErrorResponse(errorCode, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
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
  if (!req.body.lendingId || req.body.condition) {
    next(new ErrorResponse(parseInt(badRequest, 10), status.BAD_REQUEST));
  }
  try {
    await lendingsService.returnBook(
      id,
      req.body.lendingId,
      req.body.condition,
    );
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 400 && errorCode < 500) {
      next(new ErrorResponse(errorCode, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
    }
  }
  return 0;
};
