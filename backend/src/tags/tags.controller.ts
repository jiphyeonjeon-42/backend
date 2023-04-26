import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import tagsService from './tags.service';
import * as parseCheck from '../utils/parseCheck';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';
import * as errorCode from '../utils/error/errorCode';

export const createDefaultTags = async (
  req: Request,
  res: Response,
) => {
  const { id: tokenId } = req.user as any;
  const bookInfoId = req?.body?.bookInfoId;
  const content = req?.body?.content;
  // contentParseCheck(content);
  await tagsService.createDefaultTags(tokenId, bookInfoId, content);
  return res.status(status.OK).send();
};

export const searchSubDefaultTags = async (
  req: Request,
  res: Response,
) => {
  const page: number = parseCheck.pageParse(parseInt(String(req?.query?.page), 10));
  const limit: number = parseCheck.limitParse(parseInt(String(req?.query?.limit), 10));
  const visibility: string = parseCheck.stringQueryParse(req?.query?.visibility);
  const title: string = parseCheck.stringQueryParse(req?.query?.title);
  return res.status(status.OK)
    .json(await tagsService.searchSubDefaultTags(page, limit, visibility, title));
};
