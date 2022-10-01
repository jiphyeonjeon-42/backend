import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as errorCode from '../utils/error/errorCode';
import ErrorResponse from '../utils/error/errorResponse';
import { isNullish } from '../utils/isNullish';
import { logger } from '../utils/logger';
import * as BooksService from './books.service';
import * as types from './books.type';

const pubdateFormatValidator = (pubdate : string) => {
  const regexConditon = (/^[0-9]{8}$/);
  if (regexConditon.test(pubdate) === false) {
    return false;
  }
  return true;
};

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
  if (pubdateFormatValidator(pubdate) === false) {
    return next(new ErrorResponse(errorCode.INVALID_PUBDATE_FORNAT, status.BAD_REQUEST));
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
  // URI에 있는 파라미터/쿼리 변수에 저장
  const query = String(req.query.query) !== 'undefined' ? String(req.query.query) : '';
  const {
    page, limit, sort, category,
  } = req.query;

  // 유효한 인자인지 파악
  if (Number.isNaN(page) || Number.isNaN(limit)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }

  // 서비스단 실행.
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

export const createLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // parameters
  const bookInfoId = parseInt(String(req?.params?.bookInfoId), 10);
  const { id } = req.user as any;

  if (!bookInfoId) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }

  // 로직수행 및 에러처리
  try {
    return res.status(status.CREATED).send(await BooksService.createLike(id, bookInfoId));
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error.message);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};

export const deleteLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.user as any;
  const parameter = String(req?.params);
  const bookInfoId = parseInt(String(req?.params?.bookInfoId), 10);

  // parameter 검증
  if (parameter === 'undefined' || Number.isNaN(bookInfoId))
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));

  // 로직수행 및 에러처리
  try {
    return res.status(status.OK).send(await BooksService.deleteLike(id, bookInfoId));
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error.message);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};

export const getLikeInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // parameters
  const { id } = req.user as any;
  const parameter = String(req?.params);
  const bookInfoId = parseInt(String(req?.params?.bookInfoId), 10);

  // console.log("GetLikeInfo");
  // console.log("query: ", parameter);
  // console.log("bookInfoId: ", bookInfoId);

  // parameter 검증
  if (parameter === 'undefined' || Number.isNaN(bookInfoId))
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));

  // 로직수행 및 에러처리
  try {
    return res.status(status.OK).json(await BooksService.getLikeInfo(id, bookInfoId));
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error.message);
    next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};


export const updateBookInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bookInfoId = parseInt(req.params.bookInfoId, 10);
  if (bookInfoId <= 0 || bookInfoId === NaN)
    return next (new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST))
  // TODO: data 제대로 되게 처리
  let {
    title,
    author,
    publisher,
    isbn,
    image,
    categoryId,
    pubdate
  } = req.body;
  if (!(title || author || publisher || isbn || image || categoryId || pubdate)) {
    return next(new ErrorResponse(errorCode.NO_BOOK_INFO_DATA, status.BAD_REQUEST));
  }
  if (pubdateFormatValidator(pubdate) === false) {
    return next(new ErrorResponse(errorCode.INVALID_PUBDATE_FORNAT, status.BAD_REQUEST));
  }
  
  try {
    await BooksService.updateBookInfo(req.body, bookInfoId);
    return res.status(status.NO_CONTENT).send()
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    }
    logger.error(error);
    next(new ErrorResponse(errorCode.FAIL_PATCH_BOOK_BY_UNEXPECTED, status.INTERNAL_SERVER_ERROR));
  }
  return 0;
};
