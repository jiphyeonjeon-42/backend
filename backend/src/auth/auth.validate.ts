import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import * as usersService from '../users/users.service';
import { FtError, Role } from './auth.interface';
import { User } from '../users/users.model';
import config from '../config';

const authValidate = (roles: Role[]) => async (req: Request, res: Response, next: Function) => {
  try {
    if (!req.cookies.access_token) throw new FtError(401, '토큰이 발급되지 않았습니다.');
    // 토큰 복호화
    const verifyCheck = verify(req.cookies.access_token, config.jwt.secret);
    const { id } = verifyCheck as any;
    const user: { items: User[] } = await usersService.searchUserById(id);
    // User가 없는 경우
    if (user.items.length === 0) throw new FtError(401, '찾을 수 없는 유저입니다.');
    // 권한이 있지 않은 경우
    if (!roles.includes(user.items[0].role)) throw new FtError(403, '접근 불가');
    req.user = { intraProfile: req.user, id, role: user.items[0].role };
    next();
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.code).json(e.message);
    else {
      switch (e.message) {
        // 토큰에 대한 오류를 판단합니다.
        case 'INVALID_TOKEN':
        case 'TOKEN_IS_ARRAY':
        case 'NO_USER':
          res.status(401).json('유효하지 않은 토큰입니다.');
          break;
        case 'EXPIRED_TOKEN':
          res.status(410).json('토큰이 만료되었습니다.');
          break;
        default:
          res.status(500).json('서버 오류입니다.');
      }
    }
  }
};

export default authValidate;
