import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as reviewsService from '../service/reviews.service';
import ErrorResponse from '../../utils/error/errorResponse';
import * as errorCode from '../../utils/error/errorCode';
import * as errorCheck from './utils/errorCheck';
import * as parseCheck from './utils/parseCheck';
import { contentParseCheck } from './utils/errorCheck';

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
  const { id: tokenId } = req.user as any;
  const bookInfoId = req?.body?.bookInfoId;
  const content = req?.body?.content;
  try {
    contentParseCheck(content);
    await reviewsService.createReviews(tokenId, bookInfoId, content);
    return res.status(status.OK).send();
  } catch (error : any) {
    if (error.message === errorCode.INVALID_INPUT_REVIEWS_CONTENT) {
      await err(errorCode.INVALID_INPUT_REVIEWS, 400, next);
    } else {
      await err(errorCode.UNKNOWN_ERROR, 500, next);
    }
  }
  return 0;
};

export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bookInfoId = parseInt(String(req?.query?.bookInfoId), 10);
  const userId = parseInt(String(req?.query?.userId), 10);
  const page = parseCheck.pageParse(parseInt(String(req?.query?.page), 10));
  const sort = parseCheck.sortParse(req?.query?.sort);
  try {
    return res
      .status(status.OK)
      .json(await reviewsService.getReviewsPage(
        bookInfoId,
        userId,
        page,
        sort,
      ));
  } catch (error : any) {
    await err(errorCode.UNKNOWN_ERROR, 500, next);
  }
  return 0;
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
    content = errorCheck.contentParseCheck(req?.body?.content);
    reviewsId = errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);
    reviewsUserId = await errorCheck.reviewsIdExistCheck(reviewsId);
    errorCheck.idAndTokenIdSameCheck(reviewsUserId, tokenId);
    await reviewsService.updateReviews(reviewsId, tokenId, content);
    return res.status(status.OK).send();
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
  }
  return 0;
};

export const deleteReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let reviewsId;
  let reviewsUserId;
  const { id: tokenId } = req.user as any;
  const { role: auth } = req.user as any;

  try {
    reviewsId = errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);
    reviewsUserId = await errorCheck.reviewsIdExistCheck(reviewsId);
    if (auth !== 2) {
      errorCheck.idAndTokenIdSameCheck(reviewsUserId, tokenId);
    }
    await reviewsService.deleteReviews(reviewsId, tokenId);
    return res.status(status.OK).send();
  } catch (error : any) {
    if (error.message === errorCode.NOT_FOUND_REVIEWS) {
      await err(errorCode.NOT_FOUND_REVIEWS, 404, next);
    } else if (error.message === errorCode.UNAUTHORIZED_REVIEWS) {
      await err(errorCode.UNAUTHORIZED_REVIEWS, 401, next);
    } else if (error.message === errorCode.INVALID_INPUT_REVIEWS_ID) {
      await err(errorCode.INVALID_INPUT_REVIEWS_ID, 400, next);
    } else {
      await err(errorCode.UNKNOWN_ERROR, 500, next);
    }
  }
  return 0;
};
