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
  // clientURL을 검사
  const clientURL = clientValidator(req.query.state);
  if (clientURL === false) {
    next(new createError.BadRequest('Invalid client url'));
  }
  if (!req.user) res.status(401).redirect(config.client.redirectURL);

  const { intra, login, imageURL } = req.user as any;
  const ftUserInfo: FtTypes = {
    intra,
    login,
    imageURL,
  };

  try {
    let user: usersService.User = await usersService.identifyUserByLogin(ftUserInfo.login);
    // user가 없으면 생성
    if (!user) {
      user = await usersService.createUser(ftUserInfo);
    }
    const jwtInfo = authService.issueJwt(user);

    res.cookie('access_token', jwtInfo.token, {
      httpOnly: true,
      // secure: true, ANCHOR https 연결시에는 true로 설정해주어야함.
      sameSite: 'none',
      expires: new Date(jwtInfo.exp),
    });
    res.redirect(302, `${clientURL}/api/auth/me`);
  } catch (e: any) {
    next(new createError.InternalServerError(e));
  }
};

export const getMe = async (req: Request, res: Response) => {
  const { id, login, imageURL } = req.user as usersService.User;
  const user = await usersService.identifyUserById(id);
  const ftUserInfo = {
    id,
    intra: login,
    librarian: user.librarian,
    imageUrl: imageURL,
  };
  res.status(200).json(ftUserInfo);
};

export const register = async (req: Request, res: Response) => {};

export const login = async (req: Request, res: Response) => {};

export const logout = async (req: Request, res: Response) => {};