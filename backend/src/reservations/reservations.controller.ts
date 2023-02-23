import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as reservationsService from './reservations.service';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';
import * as errorCode from '../utils/error/errorCode';
import * as userUtils from '../users/users.utils';

export const create: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.user as any;
  const bookInfoId = Number.parseInt(req.body.bookInfoId, 10);
  if (Number.isNaN(bookInfoId)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    const createdReservation = await reservationsService.create(id, req.body.bookInfoId);
    logger.info(`[ES_R] : userId: ${id} bookInfoId: ${bookInfoId}`);
    return res
      .status(status.OK)
      .json(createdReservation);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 500 && errorNumber < 600) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
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

export const search: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const info = req.query;
  const query = info.query as string ? info.query as string : '';
  const page = parseInt(info.page as string, 10) ? parseInt(info.page as string, 10) : 0;
  const limit = parseInt(info.limit as string, 10) ? parseInt(info.limit as string, 10) : 5;
  const filter = info.filter as string;
  if (!filterCheck(filter)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    return res
      .status(status.OK)
      .json(await reservationsService.search(query, page, limit, filter));
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 500 && errorNumber < 600) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  } return 0;
};

export const cancel: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { role, id } = req.user as any;
  const reservationId = Number.parseInt(req.params.reservationId, 10);
  if (Number.isNaN(reservationId)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    if (userUtils.isLibrian(role)) {
      await reservationsService.cancel(reservationId);
    } else await reservationsService.userCancel(id, reservationId);
    return res.send(status.ok).json('ok');
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 500 && errorNumber < 600) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  } return 0;
};

export const count: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const bookInfoId = parseInt(req.query.bookInfo as string, 10);
  if (Number.isNaN(bookInfoId)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    const result = await reservationsService.count(bookInfoId);
    return res.status(status.OK).json(result);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 500 && errorNumber < 600) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  } return 0;
};

export const userReservations: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const info = req.query;
  const userId = parseInt(info.id as string, 10);
  if (Number.isNaN(userId)) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    return res
      .status(status.OK)
      .json(await reservationsService.userReservations(userId));
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 500 && errorNumber < 600) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  }
  return 0;
};
