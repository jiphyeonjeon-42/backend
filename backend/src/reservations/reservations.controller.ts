import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as reservationsService from './reservations.service';
import ErrorResponse from '../errorResponse';
import { logger } from '../utils/logger';

export const create: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.user as any;
  const bookInfoId = Number.parseInt(req.body.bookInfoId, 10);
  if (Number.isNaN(bookInfoId)) {
    next(new ErrorResponse(500, status.BAD_REQUEST));
  }
  try {
    return res
      .status(status.OK)
      .json(await reservationsService.create(id, req.body.bookInfoId));
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 500 && errorCode < 600) {
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

const filterCheck = (argument: string) => {
  switch (argument) {
    case 'pending':
    case 'waiting':
    case 'expired':
    case 'all':
      return 1;
    default:
      return 0;
  }
};

export const search: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const info = req.query;
  const query = info.query as string ? info.query as string : '';
  const page = parseInt(info.page as string, 10) ? parseInt(info.page as string, 10) - 1 : 0;
  const limit = parseInt(info.limit as string, 10) ? parseInt(info.limit as string, 10) : 5;
  const filter = info.filter as string;
  if (!filterCheck(filter)) {
    next(new ErrorResponse(500, status.BAD_REQUEST));
  }
  try {
    return res
      .status(status.OK)
      .json(await reservationsService.search(query, page, limit, filter));
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 500 && errorCode < 600) {
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

export const cancel: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { role, id } = req.user as any;
  const reservationId = Number.parseInt(req.params.reservationId, 10);
  if (Number.isNaN(reservationId)) {
    next(new ErrorResponse(500, status.BAD_REQUEST));
  }
  try {
    if (role === 3) {
      return res
        .status(status.OK)
        .json(await reservationsService.cancel(reservationId));
    }
    return res
      .status(status.OK)
      .json(await reservationsService.userCancel(id, reservationId));
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 500 && errorCode < 600) {
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

export const count: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bookInfoId = parseInt(req.query['book-info'] as any, 10);
  if (Number.isNaN(bookInfoId)) {
    next(new ErrorResponse(500, status.BAD_REQUEST));
  }
  try {
    return res
      .status(status.OK)
      .json(await reservationsService.count(bookInfoId));
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 500 && errorCode < 600) {
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

export const userReservations: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const info = req.query;
  const userId = parseInt(info.id as string, 10);
  if (Number.isNaN(userId)) {
    next(new ErrorResponse(500, status.BAD_REQUEST));
  }
  try {
    return res
      .status(status.OK)
      .json(await reservationsService.userReservations(userId));
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 500 && errorCode < 600) {
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
