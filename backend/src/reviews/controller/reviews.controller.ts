import {
  Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as errorCheck from './utils/errorCheck';
import * as parseCheck from './utils/parseCheck';
import ReviewsService from '../service/reviews.service';
import { createReviewsSchema, userSchema } from './reviews.type';
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

export const getReviews = async (
  req: Request,
  res: Response,
) => {
  const { id: tokenId } = req.user as any;
  const isMyReview = parseCheck.booleanQueryParse(req.query.isMyReview);
  const titleOrNickname = parseCheck.stringQueryParse(req?.query?.titleOrNickname);
  const disabled = parseCheck.disabledParse(Number(req?.query?.disabled));
  const page = parseCheck.pageParse(parseInt(String(req?.query?.page), 10));
  const sort = parseCheck.sortParse(req?.query?.sort);
  const limit = parseCheck.limitParse(parseInt(String(req?.query?.limit), 10));
  return res
    .status(status.OK)
    .json(await reviewsService.getReviewsPage(
      tokenId,
      isMyReview,
      titleOrNickname,
      disabled,
      page,
      sort,
      limit,
    ));
};

export const updateReviews = async (
  req: Request,
  res: Response,
) => {
  const { id: tokenUserId } = req.user as any;
  const content = errorCheck.contentParseCheck(req?.body?.content);
  const reviewsId = errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);
  await reviewsService.updateReviews(reviewsId, tokenUserId, content);
  return res.status(status.OK).send();
};

export const deleteReviews = async (
  req: Request,
  res: Response,
) => {
  const { id: tokenId } = req.user as any;
  const reviewsId = errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);
  const reviewsUserId = await errorCheck.reviewsIdExistCheck(reviewsId);
  errorCheck.idAndTokenIdSameCheck(reviewsUserId, tokenId);
  await reviewsService.deleteReviews(reviewsId, tokenId);
  return res.status(status.OK).send();
};

export const patchReviews = async (
  req: Request,
  res: Response,
) => {
  const { id: tokenId } = req.user as any;
  const reviewsId = errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);
  await errorCheck.reviewsIdExistCheck(reviewsId);
  await reviewsService.patchReviews(reviewsId, tokenId);
  return res.status(status.OK).send();
};
