import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import * as status from 'http-status';
import * as usersService from '../users/users.service';
import { role } from './auth.type';
import { User } from '../users/users.model';
import config from '../config';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';
import * as errorCode from '../utils/error/errorCode';

const authValidate = (roles: role[]) => async (
  req: Request,
  res: Response,
  next: Function,
) : Promise<void> => {
  try {
    if (!req.cookies.access_token) {
      throw new ErrorResponse(errorCode.noToken, 401);
    }
    // 토큰 복호화
    const verifyCheck = verify(req.cookies.access_token, config.jwt.secret);
    const { id } = verifyCheck as any;
    const user: { items: User[] } = await usersService.searchUserById(id);
    // User가 없는 경우
    if (user.items.length === 0) {
      throw new ErrorResponse(errorCode.noUser, 410);
    }
    // 권한이 있지 않은 경우
    if (!roles.includes(user.items[0].role)) {
      throw new ErrorResponse(errorCode.noAuthorization, 403);
    }
    req.user = { intraProfile: req.user, id, role: user.items[0].role };
    next();
  } catch (error: any) {
    if (error instanceof ErrorResponse) {
      next(error);
    }
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 100 && errorNumber < 200) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  }
};

export default authValidate;
