import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import * as status from 'http-status';
import * as usersService from '../users/users.service';
import {
  errMsg, errCode, role,
} from './auth.type';
import { User } from '../users/users.model';
import config from '../config';
import ErrorResponse from '../errorResponse';
import { logger } from '../utils/logger';

const authValidate = (roles: role[]) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) : Promise<void> => {
  try {
    if (!req.cookies.access_token) {
      throw new ErrorResponse(parseInt(errCode.noToken, 10), 401, errMsg.noToken);
    }
    // 토큰 복호화
    const verifyCheck = verify(req.cookies.access_token, config.jwt.secret);
    const { id } = verifyCheck as any;
    const user: { items: User[] } = await usersService.searchUserById(id);
    // User가 없는 경우
    if (user.items.length === 0) {
      throw new ErrorResponse(parseInt(errCode.noUser, 10), 410, errMsg.noUser);
    }
    // 권한이 있지 않은 경우
    if (!roles.includes(user.items[0].role)) {
      throw new ErrorResponse(parseInt(errCode.noAuthorization, 10), 403, errMsg.noAuthorization);
    }
    req.user = { intraProfile: req.user, id, role: user.items[0].role };
    next();
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 100 && errorCode < 200) {
      next(new ErrorResponse(errorCode, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
    }
  }
};

export default authValidate;
