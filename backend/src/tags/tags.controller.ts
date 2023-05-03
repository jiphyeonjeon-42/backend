import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import * as parseCheck from '../utils/parseCheck';
import { TagsService } from './tags.service';
import ErrorResponse from '../utils/error/errorResponse';
import * as errorCode from '../utils/error/errorCode';

export const createDefaultTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const bookInfoId = req?.body?.bookInfoId;
  const content = req?.body?.content;
  const tagsService = new TagsService();
  const regex: RegExp = /^[A-Za-zㅎ가-힣0-9_]+$/;
  if (content === '' || content.length > 42 || regex.test(content) === false) next(new ErrorResponse(errorCode.INVALID_INPUT_TAGS, 400));
  await tagsService.createDefaultTags(tokenId, bookInfoId, content);
  return res.status(status.CREATED).send();
};

export const searchSubDefaultTags = async (
  req: Request,
  res: Response,
) => {
  const page: number = parseCheck.pageParse(parseInt(String(req?.query?.page), 10));
  const limit: number = parseCheck.limitParse(parseInt(String(req?.query?.limit), 10));
  const visibility: string = parseCheck.stringQueryParse(req?.query?.visibility);
  const title: string = parseCheck.stringQueryParse(req?.query?.title);
  const tagsService = new TagsService();
  return res.status(status.OK)
    .json(await tagsService.searchSubDefaultTags(page, limit, visibility, title));
};

export const searchSubTags = async (
  req: Request,
  res: Response,
) => {
  const superTagId: number = parseInt(req.params.superTagId, 10);
  return res.status(status.OK).json(await new TagsService().searchSubTags(superTagId));
};

export const searchSuperDefaultTags = async (
  req: Request,
  res: Response,
) => {
  const bookInfoId: number = parseInt(req.params.bookInfoId, 10);
  return res.status(status.OK).json(await new TagsService().searchSuperDefaultTags(bookInfoId));
};

export const createSuperTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const bookInfoId = req?.body?.bookInfoId;
  const content = req?.body?.content;
  const tagsService = new TagsService();
  const regex: RegExp = /^[A-Za-zㅎ가-힣0-9_]+$/;
  if (content === '' || content === 'default' || content.length > 42 || regex.test(content) === false) next(new ErrorResponse(errorCode.INVALID_INPUT_TAGS, 400));
  await tagsService.createSuperTags(tokenId, bookInfoId, content);
  return res.status(status.CREATED).send();
};
