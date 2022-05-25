import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import config from '../config';
import { User } from '../users/users.model';

/**
 * Client URL값이 맞는지 확인
 *
 * query값중 state값이 서버에서 설정한 값과 같은지 확인
 * [보안상 확인하는거 같음]
 */
export const clientValidator = (value: any) => {
  const CLIENT_DEV_URL = 'http://localhost:4242';
  const CLIENT_PRODUCTION_URL = 'https://42library.kr';
  if (value !== CLIENT_DEV_URL && value !== CLIENT_PRODUCTION_URL) {
    return false;
  }
  return value;
};

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
    expiresIn: '60m',
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
 *      expires: 밀리세컨드 값으로 설정해야하고, 1000 * 60 * 60 = 1시간으로 설정
 */
export const saveJwt = async (req: Request, res: Response, user: User) => {
  const token = issueJwt(user);
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: true, // ANCHOR https 연결시에는 true로 설정해주어야함.
    sameSite: 'strict',
    expires: new Date(new Date().getTime() + 1000 * 60 * 60),
  });
};
