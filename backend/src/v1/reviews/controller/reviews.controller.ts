import { Request, RequestHandler, Response } from 'express';
import * as status from 'http-status';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as errorCode from '~/v1/utils/error/errorCode';
import * as parseCheck from '~/v1/utils/parseCheck';
import * as errorCheck from './utils/errorCheck';
import ReviewsService from '../service/reviews.service';
import {
  createReviewsSchema,
  deleteReviewsSchema,
  getReviewsSchema,
  patchReviewsSchema,
  queryOptionSchema,
  userSchema,
} from './reviews.type';

const reviewsService = new ReviewsService();

export const createReviews: RequestHandler = async (req, res, next) => {
  const parsedId = userSchema.safeParse(req.user);
  const parsedBody = createReviewsSchema.safeParse(req.body);

  if (!parsedId.success) {
    return next(new ErrorResponse(errorCode.NO_MATCHING_USER, 400));
  }
  if (!parsedBody.success) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT_REVIEWS_CONTENT, 400));
  }

  const { id } = parsedId.data;
  const { bookInfoId, content } = parsedBody.data;

  await reviewsService.createReviews(id, bookInfoId, content);
  return res.status(status.OK).send();
};

export const getReviews: RequestHandler = async (req, res, next) => {
  const parsedId = userSchema.safeParse(req.user);
  const parsedQuery = getReviewsSchema.safeParse(req.query);
  if (!parsedId.success) {
    return next(new ErrorResponse(errorCode.NO_MATCHING_USER, 400));
  }
  if (!parsedQuery.success) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, 400));
  }

  const { id } = parsedId.data;
  const { isMyReview, titleOrNickname, disabled, page, sort, limit } = parsedQuery.data;

  return res
    .status(status.OK)
    .json(
      await reviewsService.getReviewsPage(
        id,
        isMyReview,
        titleOrNickname ?? '',
        disabled,
        page,
        sort,
        limit,
      ),
    );
};

export const updateReviews: RequestHandler = async (req, res, next) => {
  const parsedId = userSchema.safeParse(req.user);
  if (!parsedId.success) {
    return next(new ErrorResponse(errorCode.NO_MATCHING_USER, 400));
  }
  const { id } = parsedId.data;

  const content = errorCheck.contentParseCheck(req?.body?.content);
  const reviewsId = errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);

  await reviewsService.updateReviews(reviewsId, id, content);
  return res.status(status.OK).send();
};

export const deleteReviews: RequestHandler = async (req, res, next) => {
  const parsedId = userSchema.safeParse(req.user);
  const parsedParams = deleteReviewsSchema.safeParse(req.params);
  if (!parsedId.success) {
    return next(new ErrorResponse(errorCode.NO_MATCHING_USER, 400));
  }
  if (!parsedParams.success) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT_REVIEWS_ID, 400));
  }
  const { id } = parsedId.data;
  const { reviewsId } = parsedParams.data;

  const reviewsUserId = await errorCheck.reviewsIdExistCheck(reviewsId);
  errorCheck.idAndTokenIdSameCheck(reviewsUserId, id);

  await reviewsService.deleteReviews(reviewsId, id);
  return res.status(status.OK).send();
};

export const patchReviews: RequestHandler = async (req, res, next) => {
  const parsedId = userSchema.safeParse(req.user);
  const parsedParams = patchReviewsSchema.safeParse(req.params);
  if (!parsedId.success) {
    return next(new ErrorResponse(errorCode.NO_MATCHING_USER, 400));
  }
  if (!parsedParams.success) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT_REVIEWS_ID, 400));
  }
  const { id } = parsedId.data;
  const { reviewsId } = parsedParams.data;

  await errorCheck.reviewsIdExistCheck(reviewsId);

  await reviewsService.patchReviews(reviewsId, id);
  return res.status(status.OK).send();
};
