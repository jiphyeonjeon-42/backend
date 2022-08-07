import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as errorCode from '../utils/error/errorCode';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';
import * as BooksService from './books.service';
import * as types from './books.type';

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    title, author, categoryId, pubdate,
  } = req.body;
  if (!(title && author && categoryId && pubdate)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    return res
      .status(status.OK)
      .send(await BooksService.createBook(req.body));
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};

export const createBookInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isbn = req.query.isbnQuery ? req.query.isbnQuery as string : '';
  if (isbn === '') {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    return res
      .status(status.OK)
      .send(await BooksService.createBookInfo(isbn));
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};

export const searchBookInfo = async (
  req: Request<{}, {}, {}, types.SearchBookInfoQuery>,
  res: Response,
  next: NextFunction,
) => {
  const query = String(req.query.query) !== 'undefined' ? String(req.query.query) : '';
  const {
    page, limit, sort, category,
  } = req.query;
  if (Number.isNaN(page) || Number.isNaN(limit)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    const searchBookInfoResult = await BooksService.searchInfo(
      query,
      parseInt(page, 10),
      parseInt(limit, 10),
      sort,
      category,
    );
    logger.info(`[ES_S] : ${JSON.stringify(searchBookInfoResult.items)}`);
    return res
      .status(status.OK)
      .json(searchBookInfoResult);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};

export const getBookById: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = parseInt(String(req.params.id), 10);
  if (Number.isNaN(id)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    const bookInfo = await BooksService.getBookById(req.params.id);
    return res
      .status(status.OK)
      .json(bookInfo);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};

export const getInfoId: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = parseInt(String(req.params.id), 10);
  if (Number.isNaN(id)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    const bookInfo = await BooksService.getInfo(req.params.id);
    logger.info(`[ES_C] : ${JSON.stringify(bookInfo)}`);
    return res
      .status(status.OK)
      .json(bookInfo);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};

export const sortInfo = async (
  req: Request<{}, {}, {}, types.SortInfoType>,
  res: Response,
  next: NextFunction,
) => {
  const sort = String(req.query.sort);
  const limit = parseInt(req.query.limit, 10);
  if (!(sort && limit)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    return res
      .status(status.OK)
      .json(await BooksService.sortInfo(limit, sort));
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};

export const search = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const query = String(req.query.query);
  const page = parseInt(String(req.query.page), 10);
  const limit = parseInt(String(req.query.limit), 10);
  if (query === 'undefined' || Number.isNaN(page) || Number.isNaN(limit)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    return res
      .status(status.OK)
      .json(await BooksService.search(query, page, limit));
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};
