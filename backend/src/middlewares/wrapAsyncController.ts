/* eslint-disable import/prefer-default-export */
import {
  NextFunction,
  Request, Response,
} from 'express';
import ErrorResponse from '../v1/utils/error/errorResponse';
import * as errorCode from '../v1/utils/error/errorCode';

const wrapAsyncController = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next)
    .catch((error: ErrorResponse) => next(error))
    .catch(() => next(new ErrorResponse(errorCode.UNKNOWN_ERROR, 500)));
};

export default wrapAsyncController;
