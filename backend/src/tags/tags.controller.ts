import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import TagsService from './tags.service';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';
import * as parseCheck from '../utils/parseCheck';
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
=======
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

export const mergeTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const superTagId = parseInt(req?.body?.superTagId, 10);
  const rawSubTagIds = req?.body?.subTagIds;
  const subTagIds: number[] = [];
  rawSubTagIds.forEach((subTagId: string) => {
    subTagIds.push(parseInt(subTagId, 10));
  });
  const tagsService = new TagsService();
  if (await tagsService.isDefaultTag(superTagId) === true) {
    return next(new ErrorResponse(errorCode.DEFAULT_TAG_ID, 400));
  }
  if (await tagsService.isValidTagIds(subTagIds, superTagId) === false) {
    return next(new ErrorResponse(errorCode.INVALID_TAG_ID, 400));
  }
  try {
    await tagsService.mergeTags(subTagIds, superTagId, parseInt(tokenId, 10));
  } catch (e) {
    return next(new ErrorResponse(errorCode.UPDATE_FAIL_TAGS, 500));
  }
  return res.status(status.OK).send({ id: superTagId });
};

export const updateSuperTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const superTagId = parseInt(req?.body?.id, 10);
  const content = req?.body?.content;
  const tagsService = new TagsService();
  const regex: RegExp = /^[A-Za-zㅎ가-힣0-9_]+$/;
  if (content === '' || content === 'default' || content.length > 42 || regex.test(content) === false) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT_TAGS, 400));
  }
  if (await tagsService.isExistingSuperTag(superTagId, content) === true) {
    return next(new ErrorResponse(errorCode.ALREADY_EXISTING_TAGS, 400));
  }
  if (await tagsService.isDefaultTag(superTagId) === true) {
    return next(new ErrorResponse(errorCode.DEFAULT_TAG_ID, 400));
  }
  try {
    await tagsService.updateSuperTags(tokenId, superTagId, content);
  } catch (e) {
    return next(new ErrorResponse(errorCode.UPDATE_FAIL_TAGS, 500));
  }
  return res.status(status.OK).send({ id: superTagId });
};

export const updateSubTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const subTagId = parseInt(req?.body?.id, 10);
  const visibility = req?.body?.visibility;
  const tagsService = new TagsService();
  if (visibility !== 'public' && visibility !== 'private') {
    return next(new ErrorResponse(errorCode.INVALID_INPUT_TAGS, 400));
  }
  if (await tagsService.isExistingSubTag(subTagId) === false) {
    return next(new ErrorResponse(errorCode.INVALID_TAG_ID, 400));
  }
  if (await tagsService.isAuthorizedUser(tokenId, subTagId) === false) {
    return next(new ErrorResponse(errorCode.UNAUTHORIZED_TAGS, 403));
  }
  try {
    await tagsService.updateSubTags(tokenId, subTagId, visibility);
  } catch (e) {
    return next(new ErrorResponse(errorCode.UPDATE_FAIL_TAGS, 500));
  }
  return res.status(status.OK).send({ id: subTagId });
};
