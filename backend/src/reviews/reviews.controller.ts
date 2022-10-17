import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as reviewsService from './reviews.service';
import ErrorResponse from '../utils/error/errorResponse';
import * as errorCode from '../utils/error/errorCode';
import * as errorCheck from './utils/errorCheck';

export const err = async (
    errorCode : string,
    status : number,
    next: NextFunction,
) => {
  next(new ErrorResponse(errorCode, status));
};

export const createReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  const userId = req.user as any;
  const bookInfoId = req?.body?.bookInfoId;
  const commentText = req?.body?.commentText;
  try {
    reviewsService.createReviews(userId, bookInfoId, commentText);
    return res.status(status.CREATED).send();
  } catch (error : any) {
    if (error.message === errorCode.INVALID_INPUT_REVIEWS_CONTENT) {
      await err(errorCode.INVALID_INPUT_REVIEWS, 400, next);
    } else {
      await err(errorCode.UNKNOWN_ERROR, 500, next);
    }
  }
};

export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bookInfoId = parseInt(String(req?.query?.bookInfoId));
  const userId = parseInt(String(req?.query?.userId));
  const reviewId = parseInt(String(req?.query?.reviewId));
  const sort = String(req?.query?.sort);

  const reviews = await reviewsService.getReviews
  (
    bookInfoId,
    userId,
    reviewId,
    sort
  );
  return res.status(status.OK).json(reviews);
};

export const updateReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  let reviewsId : number;
  let content : string;
  let reviewsUserId : number;

  try {
    content = await errorCheck.contentParseCheck(req?.body?.content);
    reviewsId = await errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);
    reviewsUserId = await errorCheck.reviewsIdExistCheck(reviewsId);
    await errorCheck.idAndTokenIdSameCheck(reviewsUserId, tokenId);

    await reviewsService.updateReviews(reviewsId, tokenId, content);
  } catch (error : any) {
    if (error.message === errorCode.INVALID_INPUT_REVIEWS_CONTENT) {
      await err(errorCode.INVALID_INPUT_REVIEWS_CONTENT, 400, next);
    } else if (error.message === errorCode.INVALID_INPUT_REVIEWS_ID) {
      await err(errorCode.INVALID_INPUT_REVIEWS_ID, 400, next);
    } else if (error.message === errorCode.UNAUTHORIZED_REVIEWS) {
      await err(errorCode.UNAUTHORIZED_REVIEWS, 401, next);
    } else if (error.message === errorCode.NOT_FOUND_REVIEWS) {
      await err(errorCode.NOT_FOUND_REVIEWS, 404, next);
    } else {
      await err(errorCode.UNKNOWN_ERROR, 500, next);
    }
    return 0;
  }
  return res.status(status.OK).send();
};

export const deleteReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  let reviewsId;
  const deleteUser = req.user as any;

  try {
    reviewsId = await errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);
    await reviewsService.deleteReviews(reviewsId, deleteUser);
    return res.status(status.OK).send();
  } catch (error : any) {
    if (error.message === errorCode.NOT_FOUND_REVIEWS) {
      await err(errorCode.NOT_FOUND_REVIEWS, 404, next);
    } else if (error.message === errorCode.UNAUTHORIZED_REVIEWS) {
      await err(errorCode.UNAUTHORIZED_REVIEWS, 401, next);
    } else {
      await err(errorCode.UNKNOWN_ERROR, 500, next);
    }
  }
};
