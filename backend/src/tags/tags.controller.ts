import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import TagsService from './tags.service';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';
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
  