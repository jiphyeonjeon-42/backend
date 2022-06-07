import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import ErrorResponse from '../errorResponse';
import { logger } from '../utils/logger';
import * as BooksService from './books.service';
import * as types from './books.type';

export const createBook = async (req: Request, res: Response) => {
  const {
    isbn, categoryId, donator, callSign,
  } = req.body;
  if (!(isbn && categoryId && donator && callSign)) {
    res.status(status.BAD_REQUEST).send({ errorCode: 300 });
  } else {
    try {
      return res
        .status(status.OK)
        .send(await BooksService.createBook(req.body));
    } catch (error: any) {
      if (
        parseInt(error.message, 10) >= 300
        && parseInt(error.message, 10) < 400
      ) {
        return res
          .status(status.BAD_REQUEST)
          .send({ errorCode: parseInt(error.message, 10) });
      }
      if (error.message === 'DB error') {
        return res.status(500).send({ errorCode: 1 });
      }
      return res.status(500).send({ errorCode: 0 });
    }
  }
  return 0;
};

export const searchBookInfo = async (
  req: Request<{}, {}, {}, types.SearchBookInfoQuery>,
  res: Response,
) => {
  const {
    query, sort, page, limit, category,
  } = req.query;
  if (!(query && page && limit)) {
    res.status(status.BAD_REQUEST).send({ errorCode: 300 });
  } else {
    try {
      return res
        .status(status.OK)
        .json(
          await BooksService.searchInfo(
            query,
            sort,
            parseInt(page, 10),
            parseInt(limit, 10),
            category,
          ),
        );
    } catch (error: any) {
      if (
        parseInt(error.message, 10) >= 300
        && parseInt(error.message, 10) < 400
      ) {
        return res
          .status(status.BAD_REQUEST)
          .send({ errorCode: parseInt(error.message, 10) });
      }
      if (error.message === 'DB error') {
        return res.status(500).send({ errorCode: 1 });
      }
      return res.status(500).send({ errorCode: 0 });
    }
  }
  return 0;
};

export const getInfoId: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bookId = parseInt(req.params.id, 10);
  if (Number.isNaN(bookId)) {
    res.status(status.BAD_REQUEST).send({ errorCode: 300 });
  } else {
    try {
      return res.status(status.OK).json(await BooksService.getInfo(bookId));
    } catch (error: any) {
      const errorCode = parseInt(error.message, 10);
      if (errorCode >= 300 && errorCode < 400) {
        next(new ErrorResponse(errorCode, status.BAD_REQUEST));
      } else if (error.message === 'DB error') {
        next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
      } else {
        logger.error(error.message);
        next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
      }
    }
  }
  return 0;
};

export const sortInfo = async (
  req: Request<{}, {}, {}, types.SortInfoType>,
  res: Response,
) => {
  const { sort, limit } = req.query;
  if (!(sort && limit)) {
    res.status(status.BAD_REQUEST).send({ errorCode: 300 });
  } else {
    try {
      return res
        .status(status.OK)
        .json(await BooksService.sortInfo(sort, parseInt(limit, 10)));
    } catch (error: any) {
      if (
        parseInt(error.message, 10) >= 300
        && parseInt(error.message, 10) < 400
      ) {
        return res
          .status(status.BAD_REQUEST)
          .send({ errorCode: parseInt(error.message, 10) });
      }
      if (error.message === 'DB error') {
        return res.status(500).send({ errorCode: 1 });
      }
      return res.status(500).send({ errorCode: 0 });
    }
  }
  return 0;
};

export const search = async (req: Request, res: Response) => {
  const { query, page, limit } = req.query as any;
  if (!(query && page && limit)) {
    res.status(status.BAD_REQUEST).send({ errorCode: 300 });
  } else {
    try {
      return res
        .status(status.OK)
        .json(
          await BooksService.search(
            query,
            parseInt(page, 10),
            parseInt(limit, 10),
          ),
        );
    } catch (error: any) {
      if (
        parseInt(error.message, 10) >= 300
        && parseInt(error.message, 10) < 400
      ) {
        return res
          .status(status.BAD_REQUEST)
          .send({ errorCode: parseInt(error.message, 10) });
      }
      if (error.message === 'DB error') {
        return res.status(500).send({ errorCode: 1 });
      }
      return res.status(500).send({ errorCode: 0 });
    }
  }
  return 0;
};
