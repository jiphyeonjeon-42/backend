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

const authValidateDefaultNullUser = (roles: role[]) => async (
  req: Request,
  res: Response,
  next: Function,
) : Promise<void> => {
  if (!req.cookies.access_token) {
    req.user = { intraProfile: null, id: null, role: null };
    next();
  } else {
    try {
      // 토큰 복호화
      const verifyCheck = verify(req.cookies.access_token, config.jwt.secret);
      const { id } = verifyCheck as any;
      const user: { items: User[] } = await usersService.searchUserById(id);
      // User가 없는 경우
      if (user.items.length === 0) {
        throw new ErrorResponse(errorCode.NO_USER, 410);
      }
      // 권한이 있지 않은 경우
      if (!roles.includes(user.items[0].role)) {
        throw new ErrorResponse(errorCode.NO_AUTHORIZATION, 403);
      }
      req.user = { intraProfile: req.user, id, role: user.items[0].role };
      next();
    } catch (error: any) {
      switch (error.message) {
      // 토큰에 대한 오류를 판단합니다.
        case 'INVALID_TOKEN':
        case 'TOKEN_IS_ARRAY':
        case 'NO_USER':
          return next(new ErrorResponse(errorCode.TOKEN_NOT_VALID, status.UNAUTHORIZED));
        case 'EXPIRED_TOKEN':
          return next(new ErrorResponse(errorCode.EXPIRATION_TOKEN, status.GONE));
        default:
          break;
      }
      if (error instanceof ErrorResponse) {
        next(error);
      }
      const errorNumber = parseInt(error.message, 10);
      if (errorNumber >= 100 && errorNumber < 200) {
        next(new ErrorResponse(error.message, status.BAD_REQUEST));
      } else if (error.message === 'DB error') {
        next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
      } else {
        logger.error(error);
        next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
      }
    }
  }
};

export default authValidateDefaultNullUser;
