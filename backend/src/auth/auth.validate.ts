import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import * as usersService from '../users/users.service';
import {
  errMsg, errCode, FtError, role,
} from './auth.type';
import { User } from '../users/users.model';
import config from '../config';

const authValidate = (roles: role[]) => async (req: Request, res: Response, next: Function) : Promise<void> => {
  try {
    if (!req.cookies.access_token) throw new FtError(401, errCode.noToken, errMsg.noToken);
    // 토큰 복호화
    const verifyCheck = verify(req.cookies.access_token, config.jwt.secret);
    const { id } = verifyCheck as any;
    const user: { items: User[] } = await usersService.searchUserById(id);
    // User가 없는 경우
    if (user.items.length === 0) throw new FtError(410, errCode.noUser, errMsg.noUser);
    // 권한이 있지 않은 경우
    if (!roles.includes(user.items[0].role)) {
      throw new FtError(403, errCode.noAuthorization, errMsg.noAuthorization);
    }
    req.user = { intraProfile: req.user, id, role: user.items[0].role };
    next();
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.statusCode).json({ code: e.errCode, message: e.message });
    else {
      switch (e.message) {
        // 토큰에 대한 오류를 판단합니다.
        case 'INVALID_TOKEN':
        case 'TOKEN_IS_ARRAY':
        case 'NO_USER':
          res.status(401).json({ code: errCode.tokenNotValid, message: errMsg.tokenNotValid });
          break;
        case 'EXPIRED_TOKEN':
          res.status(410).json({ code: errCode.expirationToken, message: errMsg.expirationToken });
          break;
        default:
          res.status(500).json({ code: errCode.unknownError, message: errMsg.unknownError });
      }
    }
  }
};

export default authValidate;
