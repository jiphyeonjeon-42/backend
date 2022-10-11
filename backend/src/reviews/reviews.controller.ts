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
  const bookInfoId = req?.body?.bookInfoId;
  const commentText = req?.body?.commentText;
  reviewsService.createReviews(bookInfoId, commentText);
  return res.status(status.CREATED).send();
};

export const getReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  const bookInfoId = req?.params?.bookInfoId;
  const reviews = await reviewsService.getReviews(bookInfoId);
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
  const reviewsId = req?.params?.revieswId;
  await reviewsService.deleteReviews(parseInt(reviewsId, 10));
  return res.status(status.OK).send();
};
