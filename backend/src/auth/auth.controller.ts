import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import config from '../config';
import * as usersService from '../users/users.service';
import * as authService from './auth.service';
import * as authJwt from './auth.jwt';
import * as models from '../users/users.model';
import {
  FtError, role, errCode, errMsg,
} from './auth.type';

export const getOAuth = (req: Request, res: Response) => {
  const clientId = config.client.id;
  const redirectURL = `${config.client.redirectURL}/api/auth/token`;
  const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectURL,
  )}&response_type=code&`;
  res.status(302).redirect(oauthUrl);
};

export const getToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user as any;
    const user: models.User[] = await usersService.searchUserByIntraId(id);
    if (user.length === 0) throw new FtError(401, errCode.noUser, errMsg.noUser);
    await authJwt.saveJwt(req, res, user[0]);
    res.status(302).redirect(`${config.client.clientURL}/auth`);
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.statusCode).json({ code: e.errCode, message: e.message });
    else res.status(500).json({ code: errCode.unknownError, message: errMsg.unknownError });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user as any;
    const user: { items: models.User[] } = await usersService.searchUserById(id);
    if (user.items.length === 0) throw new FtError(410, errCode.noUser, errMsg.noUser);
    const result = {
      id: user.items[0].id,
      intra: user.items[0].nickname.length === 0 ? user.items[0].email : user.items[0].nickname,
      librarian: user.items[0].role === 2,
    };
    res.status(200).json(result);
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.statusCode).json({ code: e.errCode, message: e.message });
    else res.status(500).json({ code: errCode.unknownError, message: errMsg.unknownError });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, password } = req.body;
    if (!id || !password) throw new FtError(400, errCode.noInput, errMsg.noInput);
    /* 여기에 id, password의 유효성 검증 한번 더 할 수도 있음 */
    const user: { items: models.User[] } = await usersService.searchUserByEmail(id);
    if (user.items.length === 0) throw new FtError(401, errCode.noId, errMsg.noId);
    if (!bcrypt.compareSync(password, user.items[0].password)) {
      throw new FtError(403, errCode.wrongPassword, errMsg.wrongPassword);
    }
    await authJwt.saveJwt(req, res, user.items[0]);
    res.status(204).send();
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.statusCode).json({ code: e.errCode, message: e.message });
    else res.status(500).json({ code: errCode.unknownError, message: errMsg.unknownError });
  }
};

export const logout = (req: Request, res: Response) => {
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

export const intraAuthentication = async (req: Request, res: Response) : Promise<void> => {
  try {
    const { intraProfile, id } = req.user as any;
    const { intraId, nickName } = intraProfile;
    const intraList: models.User[] = await usersService.searchUserByIntraId(intraId);
    if (intraList.length !== 0) {
      throw new FtError(401, errCode.alreadyAuthenticated, errMsg.alreadyAuthenticated);
    }
    const user: { items: models.User[] } = await usersService.searchUserById(id);
    if (user.items.length === 0) throw new FtError(410, errCode.noUser, errMsg.noUser);
    if (user.items[0].role !== role.user) {
      throw new FtError(401, errCode.alreadyAuthenticated, errMsg.alreadyAuthenticated);
    }
    const affectedRow = await authService.updateAuthenticationUser(id, intraId, nickName);
    if (affectedRow === 0) {
      throw new FtError(401, errCode.queryExecutionFailed, errMsg.queryExecutionFailed);
    }
    await authJwt.saveJwt(req, res, user.items[0]);
    res.status(200).send();
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.statusCode).json({ code: e.errCode, message: e.message });
    else res.status(500).json({ code: errCode.unknownError, message: errMsg.unknownError });
  }
};
