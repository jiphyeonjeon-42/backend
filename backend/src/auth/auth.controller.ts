import { Request, Response } from 'express';
import { send } from 'process';
import config from '../config';
import { ftTypes } from './auth.service';
import clientValidator from './auth.validator';

export const getOAuth = (req: Request, res: Response) => {
  const clientId = config.client.id;
  const redirectURL = config.client.redirectURL ?? 'http://localhost:3000/auth/token';
  const clientURL = (req.query.clientURL as string) ?? 'http://localhost:3000/welcome';

  const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectURL,
  )}&response_type=code&state=${encodeURIComponent(clientURL)}`;
  res.status(302).redirect(oauthUrl);
};

export const getToken = (req: Request, res: Response): void => {
  const clientURL = clientValidator(req.query.client_url);
  if (!req.user) res.status(401).redirect(config.client.redirectURL as string);
  res.send(req.user);
  // 아래 실행되지 않음

  const { intra, login, imageURL } = req.user as any;
  const ftUserInfo: ftTypes = {
    intra,
    login,
    image: imageURL,
  };

  // TODOs
  // let user = await this.userService.userFind(ftUserInfo.login);
  // if (!user) {
  //   user = await this.userService.userSave(ftUserInfo);
  // }
  // const jwtToken = await this.authService.jwtGen(req.user, user.id);

  // res.cookie('access_token', jwtToken, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'none',
  //   expires: new Date(Date.now() + 15 * 1000 * 60 * 60 * 24),
  // });
  return res.status(302).redirect(`${clientURL}/auth`);
};
