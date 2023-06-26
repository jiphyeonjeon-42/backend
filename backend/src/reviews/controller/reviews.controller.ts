import {
  Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as errorCheck from './utils/errorCheck';
import * as parseCheck from './utils/parseCheck';
import ReviewsService from '../service/reviews.service';
import {
  createReviewsSchema, getReviewsSchema, queryOptionSchema, userSchema,
} from './reviews.type';
import ErrorResponse from '../../utils/error/errorResponse';
import * as errorCode from '../../utils/error/errorCode';

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
  const {
    isMyReview, titleOrNickname, disabled, page, sort, limit,
  } = parsedQuery.data;

  return res
    .status(status.OK)
    .json(await reviewsService.getReviewsPage(
      id,
      isMyReview,
      titleOrNickname ?? '',
      disabled,
      page,
      sort,
      limit,
    ));
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
  if (!parsedId.success) {
    return next(new ErrorResponse(errorCode.NO_MATCHING_USER, 400));
  }
  const { id } = parsedId.data;

  const reviewsId = errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);
  const reviewsUserId = await errorCheck.reviewsIdExistCheck(reviewsId);

  errorCheck.idAndTokenIdSameCheck(reviewsUserId, id);
  await reviewsService.deleteReviews(reviewsId, id);
  return res.status(status.OK).send();
};

export const patchReviews: RequestHandler = async (req, res, next) => {
  const parsedId = userSchema.safeParse(req.user);
  if (!parsedId.success) {
    return next(new ErrorResponse(errorCode.NO_MATCHING_USER, 400));
  }
  const { id } = parsedId.data;

  const reviewsId = errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);

  await errorCheck.reviewsIdExistCheck(reviewsId);
  await reviewsService.patchReviews(reviewsId, id);
  return res.status(status.OK).send();
};
