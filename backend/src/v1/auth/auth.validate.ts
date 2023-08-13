import { Request, Response } from 'express';
import * as status from 'http-status';
import { verify } from 'jsonwebtoken';
import { jwtOption } from '~/config';
import { logger } from '~/logger';
import UsersService from '~/v1/users/users.service';
import * as errorCode from '~/v1/utils/error/errorCode';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import { User } from '../DTO/users.model';
import { role } from './auth.type';

const usersService = new UsersService();

const authValidate = (roles: role[]) => async (
  req: Request,
  res: Response,
  next: Function,
) : Promise<void> => {
  try {
    if (!req.cookies.access_token) {
      throw new ErrorResponse(errorCode.NO_TOKEN, 401);
    }
    // 토큰 복호화
    const verifyCheck = verify(req.cookies.access_token, jwtOption.secret);
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
    req.user = { intraProfile: req.user, id, role: user.items[0].role, nickname: user.items[0].nickname };
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
};

export default authValidate;
