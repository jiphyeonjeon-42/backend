import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import config from '../config';
import * as usersService from '../users/users.service';
import * as authService from './auth.service';
import * as authJwt from './auth.jwt';
import * as models from '../users/users.model';
import { FtError, role } from './auth.type';
import slack from "./auth.slack";

export const getOAuth = (req: Request, res: Response) => {
  const clientId = config.client.id;
  const redirectURL = `${config.client.redirectURL}/api/auth/token`;
  const clientURL = (req.query.clientURL as string) ?? 'http://localhost:4242';
  const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectURL,
  )}&response_type=code&state=${encodeURIComponent(clientURL)}`;
  res.status(302).redirect(oauthUrl);
};

export const getToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientURL = authJwt.clientValidator(req.query.state);
    if (clientURL === false || !req.user) throw new FtError(403, 'invalid data');
    const { id } = req.user as any;
    const user: models.User[] = await usersService.searchUserByIntraId(id);
    if (user.length === 0) throw new FtError(401, 'not found user');
    await authJwt.saveJwt(req, res, user[0]);
    res.status(302).redirect(`${config.client.clientURL}/auth`);
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.code).json(e.message);
    else throw e;
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const { id } = req.user as any;
    const user: { items: models.User[] } = await usersService.searchUserById(id);
    if (user.items.length === 0) throw new FtError(401, 'not found user');
    const result = {
      id: user.items[0].id,
      intra: user.items[0].nickName.length === 0 ? user.items[0].email : user.items[0].nickName,
      librarian: user.items[0].role === 2,
    };
    res.status(200).json(result);
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.code).json(e.message);
    else throw e;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;
    if (!id || !password) throw new FtError(400, 'empty field');
    /* 여기에 id, password의 유효성 검증 한번 더 할 수도 있음 */
    const user: { items: models.User[] } = await usersService.searchUserByEmail(id);
    if (user.items.length === 0) throw new FtError(401, 'not found user');
    if (!bcrypt.compareSync(password, user.items[0].password)) throw new FtError(403, 'not equals password');
    await authJwt.saveJwt(req, res, user.items[0]);
    res.status(302).redirect(`${config.client.clientURL}/auth`);
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.code).json(e.message);
    else throw e;
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie('access_token', null, { maxAge: 0, httpOnly: true });
  res.status(204).send();
};

export const getIntraAuthentication = (req: Request, res: Response) => {
  const clientId = config.client.id;
  const redirectURL = `${config.client.redirectURL}/api/auth/intraAuthentication`;
  const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectURL,
  )}&response_type=code&}`;
  res.status(302).redirect(oauthUrl);
};

export const intraAuthentication = async (req: Request, res: Response) => {
  try {
    const { intraProfile, id } = req.user as any;
    const { intraId, nickName } = intraProfile;
    const intraList: models.User[] = await usersService.searchUserByIntraId(intraId);
    if (intraList.length !== 0) throw new FtError(401, 'authenticated intra user');
    const user: { items: models.User[] } = await usersService.searchUserById(id);
    if (user.items.length === 0) throw new FtError(401, 'not found user');
    if (user.items[0].role !== role.user) throw new FtError(401, 'already authenticated');
    const affectedRow = await authService.updateAuthenticationUser(id, intraId, nickName);
    if (affectedRow === 0) throw new FtError(401, 'update sql error');
    await authJwt.saveJwt(req, res, user.items[0]);
    res.status(200).send();
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.code).json(e.message);
    else throw e;
  }
};

export const updateSlackList = async (req: Request, res: Response) => {
  try {
    await slack.updateSlackID();
    res.status(204).send();
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.code).json(e.message);
    else res.status(500).json('알 수 없는 오류');
  }
};
