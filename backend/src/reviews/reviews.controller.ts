import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as reviewsService from './reviews.service';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';
import * as errorCode from '../utils/error/errorCode';

export const createReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  const userId = req.user as any;
  const bookInfoId = req?.body?.bookInfoId;
  const commentText = req?.body?.commentText;
  reviewsService.createReviews(userId, bookInfoId, commentText);
  return res.status(status.CREATED).send();
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
  reviewsService.updateReviews();
  return res.status(status.OK).send();
};

export const deleteReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  const deleteUser = req.user as any;
  const reviewsId = req?.params?.reviewsId;
  await reviewsService.deleteReviews(parseInt(reviewsId, 10), deleteUser);
  return res.status(status.OK).send();
};
