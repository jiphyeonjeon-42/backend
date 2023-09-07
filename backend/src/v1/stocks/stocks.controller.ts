import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as status from 'http-status';
import * as errorCode from '~/v1/utils/error/errorCode';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as stocksService from './stocks.service';

export const stockSearch: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { query } = req;
  const page = parseInt(query.page as string, 10) ? parseInt(query.page as string, 10) : 0;
  const limit = parseInt(query.limit as string, 10) ? parseInt(query.limit as string, 10) : 10;
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
  const { id } = req.body;
  const bookId = parseInt(id as string, 10) ? parseInt(id as string, 10) : 0;
  try {
    const stock = await stocksService.updateBook(bookId);
    res.status(200).send(stock);
  } catch (error: any) {
    if (error.message === '701') {
      next(new ErrorResponse(errorCode.NO_BOOK_ID, status.BAD_REQUEST));
    } else {
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  }
};
