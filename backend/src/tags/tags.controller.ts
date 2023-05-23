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
  const content = req?.body?.content.trim();
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
    const content = req?.body?.content.trim();
    const tagsService = new TagsService();
    const regex: RegExp = /^[A-Za-zㅎ가-힣0-9_]+$/;
    if (content === '' || content === 'default' || content.length > 42 || regex.test(content) === false) next(new ErrorResponse(errorCode.INVALID_INPUT_TAGS, 400));
    await tagsService.createSuperTags(tokenId, bookInfoId, content);
    return res.status(status.CREATED).send();
  };
  
  export const deleteSuperTags = async (
    req: Request,
    res: Response,
  ) => {
    const { id: tokenId } = req.user as any;
    const superTagId = req?.params?.tagId;
    const tagsService = new TagsService();
    await tagsService.deleteSuperTag(parseInt(superTagId, 10), tokenId);
    return res.status(status.OK).send();
  };

  export const deleteSubTags = async (
    req: Request,
    res: Response,
  ) => {
    const { id: tokenId } = req.user as any;
    const subTagId = req?.params?.tagId;
    const tagsService = new TagsService();
    await tagsService.deleteSubTag(parseInt(subTagId, 10), tokenId);
    return res.status(status.OK).send();
  };