import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import * as reviewsService from '../service/reviews.service';
import * as errorCheck from './utils/errorCheck';
import * as parseCheck from './utils/parseCheck';
import { contentParseCheck } from './utils/errorCheck';

export const createReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const bookInfoId = req?.body?.bookInfoId;
  const content = req?.body?.content;
  contentParseCheck(content);
  await reviewsService.createReviews(tokenId, bookInfoId, content);
  return res.status(status.OK).send();
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
  return res
    .status(status.OK)
    .json(await reviewsService.getReviewsPage(
      bookInfoId,
      userId,
      page,
      sort,
    ));
};

export const updateReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const content = errorCheck.contentParseCheck(req?.body?.content);
  const reviewsId = errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);
  const reviewsUserId = await errorCheck.reviewsIdExistCheck(reviewsId);
  errorCheck.idAndTokenIdSameCheck(reviewsUserId, tokenId);
  await reviewsService.updateReviews(reviewsId, tokenId, content);
  return res.status(status.OK).send();
};

export const deleteReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const { role: auth } = req.user as any;
  const reviewsId = errorCheck.reviewsIdParseCheck(req?.params?.reviewsId);
  const reviewsUserId = await errorCheck.reviewsIdExistCheck(reviewsId);
  if (auth !== 2) {
    errorCheck.idAndTokenIdSameCheck(reviewsUserId, tokenId);
  }
  await reviewsService.deleteReviews(reviewsId, tokenId);
  return res.status(status.OK).send();
};
