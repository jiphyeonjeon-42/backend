import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import config from '../config';
import { User } from '../users/users.model';

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
  const secretKey = config.jwt.secret;
  const options = {
    expiresIn: '480m',
    issuer: config.mode === 'local' ? 'localhost' : 'server.42library.kr',
  };
  return jwt.sign(payload, secretKey, options);
};

/**
 * JWT를 클라이언트 cookie에 저장하기
 *
 * issueJwt 함수를 이용해 JWT를 생성하고, 토큰을 클라이언트 Cookie에 저장한다.
 * 설정값 설명
 *      httpOnly : 브라우저에서만 쿠키를 사용할 수 있게 설정
 *      secure : https 에서만 사용할 수 있도록 설정
 *      sameSite : 같은 도메인의에서만 쿠키를 사용할 수 있는 'strict' 값 설정
 *      expires: 밀리세컨드 값으로 설정해야하고, 1000 * 60 * 480 = 8시간으로 설정
 */
export const saveJwt = async (req: Request, res: Response, user: User) : Promise<void> => {
  const token = issueJwt(user);
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: config.mode === 'prod' ? true : false, // ANCHOR https 연결시에는 true로 설정해주어야함.
    sameSite: 'lax',
    path: '/',
    domain: config.mode === 'prod' ? '42library.kr' : 'localhost',
    expires: new Date(new Date().getTime() + 1000 * 60 * 480),
  });
};
