import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import TagsService from './tags.service';
import ErrorResponse from '../utils/error/errorResponse';
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
  const regex = /[^가-힣a-zA-Z0-9_]/g;
  if (content === '' || content.length > 42 || regex.test(content) === true) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.INVALID_INPUT_TAGS, 400));
  }
  if (await tagsService.isValidBookInfoId(parseInt(bookInfoId, 10)) === false) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.INVALID_BOOKINFO_ID, 400));
  }
  if (await tagsService.isDuplicatedSubDefaultTag(content, bookInfoId)) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.DUPLICATED_SUB_DEFAULT_TAGS, 400));
  }
  await tagsService.createDefaultTags(tokenId, bookInfoId, content);
  await tagsService.releaseConnection();
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
  const regex = /[^가-힣a-zA-Z0-9_]/g;
  if (content === '' || content === 'default' || content.length > 42 || regex.test(content) === true) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.INVALID_INPUT_TAGS, 400));
  }
  if (await tagsService.isValidBookInfoId(parseInt(bookInfoId, 10)) === false) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.INVALID_BOOKINFO_ID, 400));
  }
  if (await tagsService.isDuplicatedSuperTag(content, bookInfoId)) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.DUPLICATED_SUPER_TAGS, 400));
  }
  const superTagInsertion = await tagsService.createSuperTags(tokenId, bookInfoId, content);
  await tagsService.releaseConnection();
  return res.status(status.CREATED).send(superTagInsertion);
};

export const deleteSuperTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const superTagId = Number(req?.params?.tagId);
  const tagsService = new TagsService();

  if (superTagId === 0 || Number.isNaN(superTagId)) {
    return next(new ErrorResponse(errorCode.INVALID_TAG_ID, 400));
  }
  await tagsService.deleteSuperTag(superTagId, tokenId);
  await tagsService.releaseConnection();
  return res.status(status.OK).send();
};

export const deleteSubTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const subTagId = Number(req?.params?.tagId);
  const tagsService = new TagsService();

  if (subTagId === 0 || Number.isNaN(subTagId)) {
    return next(new ErrorResponse(errorCode.INVALID_TAG_ID, 400));
  }
  await tagsService.deleteSubTag(subTagId, tokenId);
  await tagsService.releaseConnection();
  return res.status(status.OK).send();
};

export const searchSubDefaultTags = async (
  req: Request,
  res: Response,
) => {
  const page: number = parseCheck.pageParse(parseInt(String(req?.query?.page), 10));
  const limit: number = parseCheck.limitParse(parseInt(String(req?.query?.limit), 10));
  const visibility: string = parseCheck.stringQueryParse(req?.query?.visibility);
  const query: string = parseCheck.stringQueryParse(req?.query?.query);
  const tagsService = new TagsService();
  const subDefaultTags: Object = await tagsService.searchSubDefaultTags(
    page,
    limit,
    visibility,
    query,
  );
  await tagsService.releaseConnection();
  return res.status(status.OK).json(subDefaultTags);
};

export const searchSubTags = async (
  req: Request,
  res: Response,
) => {
  const superTagId: number = parseInt(req.params.superTagId, 10);
  const tagsService = new TagsService();
  const subTags = await tagsService.searchSubTags(superTagId);
  await tagsService.releaseConnection();
  return res.status(status.OK).json(subTags);
};

export const searchSuperDefaultTags = async (
  req: Request,
  res: Response,
) => {
  const bookInfoId: number = parseInt(req.params.bookInfoId, 10);
  const tagsService = new TagsService();
  const superDefaultTags = await tagsService.searchSuperDefaultTags(bookInfoId);
  await tagsService.releaseConnection();
  return res.status(status.OK).json(superDefaultTags);
};

export const mergeTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const bookInfoId = Number(req?.params?.bookInfoId);
  const superTagId = Number(req?.body?.superTagId);
  const subTagIds: number[] = req?.body?.subTagIds;
  const tagsService = new TagsService();
  let returnSuperTagId = 0;

  if (await tagsService.isValidBookInfoId(bookInfoId) === false) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.INVALID_BOOKINFO_ID, 400));
  }
  if (superTagId !== 0
      && await tagsService.isValidSuperTagId(superTagId, bookInfoId) === false) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.INVALID_TAG_ID, 400));
  }
  if (await tagsService.isValidSubTagId(subTagIds) === false) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.INVALID_TAG_ID, 400));
  }
  try {
    returnSuperTagId = await tagsService.mergeTags(
      bookInfoId,
      subTagIds,
      superTagId,
      parseInt(tokenId, 10),
    );
  } catch (e) {
    return next(new ErrorResponse(errorCode.UPDATE_FAIL_TAGS, 500));
  } finally {
    await tagsService.releaseConnection();
  }
  return res.status(status.OK).send({ id: returnSuperTagId });
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
  const regex = /[^가-힣a-zA-Z0-9_]/g;
  if (content === '' || content === 'default' || content.length > 42 || regex.test(content) === true) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.INVALID_INPUT_TAGS, 400));
  }
  if (await tagsService.isExistingSuperTag(superTagId, content) === true) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.ALREADY_EXISTING_TAGS, 400));
  }
  if (await tagsService.isDefaultTag(superTagId) === true) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.DEFAULT_TAG_ID, 400));
  }
  try {
    await tagsService.updateSuperTags(tokenId, superTagId, content);
  } catch (e) {
    return next(new ErrorResponse(errorCode.UPDATE_FAIL_TAGS, 500));
  } finally {
    await tagsService.releaseConnection();
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
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.INVALID_INPUT_TAGS, 400));
  }
  if (await tagsService.isExistingSubTag(subTagId) === false) {
    await tagsService.releaseConnection();
    return next(new ErrorResponse(errorCode.INVALID_TAG_ID, 400));
  }
  try {
    await tagsService.updateSubTags(tokenId, subTagId, visibility);
  } catch (e) {
    return next(new ErrorResponse(errorCode.UPDATE_FAIL_TAGS, 500));
  } finally {
    await tagsService.releaseConnection();
  }
  return res.status(status.OK).send({ id: subTagId });
};
