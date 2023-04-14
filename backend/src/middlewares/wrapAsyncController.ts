/* eslint-disable import/prefer-default-export */
import {
  NextFunction,
  Request, Response,
} from 'express';
import ErrorResponse from '../utils/error/errorResponse';
import * as errorCode from '../utils/error/errorCode';

const wrapAsyncController = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch((error: ErrorResponse) => next(error));
  fn(req, res, next).catch(() => next(new ErrorResponse(errorCode.UNKNOWN_ERROR, 500)));
};

export default wrapAsyncController;
