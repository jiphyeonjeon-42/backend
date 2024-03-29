import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { cookieOptions, jwtOption } from '~/config';
import { User } from '../DTO/users.model';

/**
 * User 정보를 가지고 token 만들기
 *
 * payload 로 user.id, user.role을 저장하고, secretkey는 config파일을 참조하고,
 * option에 유효기간과 발행처를 작성한 토큰을 발급한다.
 */
export const issueJwt = (user: User) => {
  const payload = {
    id: user.id,
  };
  const secretKey = jwtOption.secret;
  const options = {
    expiresIn: '480m',
    issuer: jwtOption.issuer,
  };
  return jwt.sign(payload, secretKey, options);
};

/**
 * JWT를 클라이언트 cookie에 저장하기
 *
 * issueJwt 함수를 이용해 JWT를 생성하고, 토큰을 클라이언트 Cookie에 저장한다.
 * 설정값 설명
 *      expires: 밀리세컨드 값으로 설정해야하고, 1000 * 60 * 480 = 8시간으로 설정
 */
export const saveJwt = async (req: Request, res: Response, user: User): Promise<void> => {
  const token = issueJwt(user);
  res.cookie('access_token', token, {
    ...cookieOptions,
    expires: new Date(new Date().getTime() + 1000 * 60 * 480),
  });
};
