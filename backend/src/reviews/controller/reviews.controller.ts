import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import * as reviewsService from '../service/reviews.service';
import * as errorCheck from './utils/errorCheck';
import * as parseCheck from './utils/parseCheck';
import { contentParseCheck } from './utils/errorCheck';
import {titleParse} from "./utils/parseCheck";

export const createReviews = async (
  req: Request,
  res: Response,
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
) => {
  const bookInfoId = parseInt(String(req?.query?.bookInfoId), 10);
  const userId = parseInt(String(req?.query?.userId), 10);
  const page = parseCheck.pageParse(parseInt(String(req?.query?.page), 10));
  const sort = parseCheck.sortParse(req?.query?.sort);
  const title = parseCheck.titleParse(req?.query?.title);
  const intraId = parseCheck.intraIdParse(req?.query?.intraId);
  // disabled는 온오프로 할 것인가 아니면 true일 경우만 disabled를 반활할 것인가
  const disabled = parseCheck.disabledParse(Boolean(req?.query?.disabled));
  return res
    .status(status.OK)
    .json(await reviewsService.getReviewsPage(
      bookInfoId,
      userId,
      page,
      sort,
      title,
      intraId,
      disabled,
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
