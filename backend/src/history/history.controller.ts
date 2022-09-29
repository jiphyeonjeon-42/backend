import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as historyService from './history.service';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';
import * as errorCode from '../utils/error/errorCode';

export const history = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const history = await historyService.history();
  return res.status(status.OK).json(history);
};
