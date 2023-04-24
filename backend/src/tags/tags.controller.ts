import {
    NextFunction, Request, Response,
  } from 'express';
  import * as status from 'http-status';
  import tagsService from './tags.service';
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
  