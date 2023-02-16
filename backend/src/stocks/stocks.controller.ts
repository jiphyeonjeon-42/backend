import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as errorCode from '../utils/error/errorCode';
import ErrorResponse from '../utils/error/errorResponse';
import * as stocksService from './stocks.service';

export const stockSearch: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { query } = req;
  const page = parseInt(query.page as string, 10) ? parseInt(query.page as string, 10) : 0;
  const limit = parseInt(query.limit as string, 10) ? parseInt(query.limit as string, 10) : 0;
  try {
    const result = await stocksService.getAllStocks(page, limit);
    res.status(200).send(result);
  } catch (error: any) {
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
};

export const stockUpdate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { query } = req;
  const bookId = parseInt(query.id as string, 10) ? parseInt(query.id as string, 10) : 0;
  try {
    await stocksService.updateBook(bookId);
    res.sendStatus(200);
  } catch (error: any) {
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
};
