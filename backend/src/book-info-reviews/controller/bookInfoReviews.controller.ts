import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import * as bookInfoReviewsService from '../service/bookInfoReviews.service';
import * as errorCheck from './utils/errorCheck';
import * as parseCheck from './utils/parseCheck';

export const getBookInfoReviewsPage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bookInfoId = errorCheck.bookInfoParseCheck(req?.params?.bookInfoId);
  const reviewsId = parseCheck.reviewsIdParse(req?.query?.reviewsId);
  const sort : 'asc' | 'desc' = parseCheck.sortParse(req?.query?.sort);
  const limit = parseInt(String(req?.query?.limit), 10);
  return res
    .status(status.OK)
    .json(await bookInfoReviewsService.getPageNoOffset(bookInfoId, reviewsId, sort, limit));
};
