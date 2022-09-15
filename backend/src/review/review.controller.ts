import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as reviewService from './review.service';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';
import * as errorCode from '../utils/error/errorCode';

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bookInfoId = req?.body?.bookInfoId;
  const commentText = req?.body?.commentText;
  reviewService.createReview(bookInfoId, commentText);
  return res.status(status.CREATED).send();
};

export const getReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  reviewService.getReview();
  return res.status(status.OK).json({ review: 'blala' });
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  reviewService.updateReview();
  return res.status(status.OK).send();
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('delete review');
  return res.status(status.OK).send();
};
