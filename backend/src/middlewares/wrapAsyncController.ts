import ErrorResponse from '../utils/error/errorResponse';
import * as errorCode from '../utils/error/errorCode';

export const wrapAsyncController = (fn : any) => (req: any, res: any, next: any) => {
  fn(req, res, next).catch((error : any) => {
    if (error.message === errorCode.INVALID_INPUT_REVIEWS_CONTENT) {
      next(new ErrorResponse(errorCode.INVALID_INPUT_REVIEWS_CONTENT, 400));
    } else if (error.message === errorCode.INVALID_INPUT) {
      next(new ErrorResponse(errorCode.INVALID_INPUT, 400));
    } else if (error.message === errorCode.INVALID_INPUT_REVIEWS_ID) {
      next(new ErrorResponse(errorCode.INVALID_INPUT_REVIEWS_ID, 400, next));
    } else if (error.message === errorCode.DISABLED_REVIEWS) {
      next(new ErrorResponse(errorCode.DISABLED_REVIEWS, 401, next));
    } else if (error.message === errorCode.UNAUTHORIZED_REVIEWS) {
      next(new ErrorResponse(errorCode.UNAUTHORIZED_REVIEWS, 401, next));
    } else if (error.message === errorCode.NOT_FOUND_REVIEWS) {
      next(new ErrorResponse(errorCode.NOT_FOUND_REVIEWS, 404, next));
    } else {
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, 500));
    }
  });
};
