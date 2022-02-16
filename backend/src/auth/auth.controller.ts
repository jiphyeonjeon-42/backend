import { Request, Response, NextFunction } from 'express';
import * as createError from 'http-errors';
import config from '../config';
import { FtTypes } from './auth.service';
import clientValidator from './auth.validator';
import * as usersService from '../users/users.service';
import * as authService from './auth.service';

export const getOAuth = (req: Request, res: Response) => {
  const clientId = config.client.id;
  const redirectURL = config.client.redirectURL ?? 'http://localhost:3000/auth/token';
  const clientURL = (req.query.clientURL as string) ?? 'http://localhost:3000';

  const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectURL,
  )}&response_type=code&state=${encodeURIComponent(clientURL)}`;
  res.status(302).redirect(oauthUrl);
};

export const getToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const clientURL = clientValidator(req.query.state);
  if (clientURL === false) {
    next(new createError.BadRequest('Invalid client url'));
  }
  if (!req.user) res.status(401).redirect(config.client.redirectURL);
  // 아래 실행되지 않음

  const { intra, login, imageURL } = req.user as any;
  const ftUserInfo: FtTypes = {
    intra,
    login,
    imageURL,
  };

  // TODOs
  let user: usersService.User = await usersService.identifyUserByLogin(ftUserInfo.login);
  if (!user) {
    user = await usersService.createUser(ftUserInfo);
  }
  const jwtInfo = authService.issueJwt(user);

  res.cookie('access_token', jwtInfo.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(jwtInfo.exp),
  });
  return res.status(302).redirect(`${clientURL}/auth`);
};

/**
 * @openapi
 * /api/auth/me:
 *    get:
 *      description: 클라이언트의 로그인된 유저 정보를 받아온다.
 *      responses:
 *        200:
 *          description: 클라이언트의 정보를 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                properties:
 *                  id:
 *                    description: 집현전 웹서비스에서의 유저 아이디
 *                    type: integer
 *                  intra:
 *                    description: 인트라 아이디
 *                    type: string
 *                  librarian:
 *                    description: 사서 여부
 *                    type: boolean
 *                  imageUrl:
 *                    description: 인트라넷 프로필 이미지 주소
 *                    type: string
 */

/**
 *
 */

export const getMe = () => {};
