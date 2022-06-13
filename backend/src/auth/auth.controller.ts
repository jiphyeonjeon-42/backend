import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import * as status from 'http-status';
import config from '../config';
import * as usersService from '../users/users.service';
import * as authService from './auth.service';
import * as authJwt from './auth.jwt';
import * as models from '../users/users.model';
import {
  role, errCode, errMsg,
} from './auth.type';
import slack from './auth.slack';
import ErrorResponse from '../errorResponse';
import { logger } from '../utils/logger';

export const getOAuth = (
  req: Request,
  res: Response,
) => {
  const clientId = config.client.id;
  const redirectURL = `${config.client.redirectURL}/api/auth/token`;
  const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectURL,
  )}&response_type=code&`;
  res.status(302).redirect(oauthUrl);
};

export const getToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.user as any;
    const user: models.User[] = await usersService.searchUserByIntraId(id);
    if (user.length === 0) {
      next(new ErrorResponse(parseInt(errCode.noUser, 10), 401, errMsg.noUser));
    }
    await authJwt.saveJwt(req, res, user[0]);
    res.status(302).redirect(`${config.client.clientURL}/auth`);
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 100 && errorCode < 200) {
      next(new ErrorResponse(errorCode, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
    }
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.user as any;
    const user: { items: models.User[] } = await usersService.searchUserById(id);
    if (user.items.length === 0) {
      next(new ErrorResponse(parseInt(errCode.noUser, 10), 410, errMsg.noUser));
    }
    const result = {
      id: user.items[0].id,
      intra: user.items[0].nickname.length === 0 ? user.items[0].email : user.items[0].nickname,
      librarian: user.items[0].role === 2,
    };
    res.status(200).json(result);
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 100 && errorCode < 200) {
      next(new ErrorResponse(errorCode, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, password } = req.body;
    if (!id || !password) {
      next(new ErrorResponse(parseInt(errCode.noInput, 10), 400, errMsg.noInput));
    }
    /* 여기에 id, password의 유효성 검증 한번 더 할 수도 있음 */
    const user: { items: models.User[] } = await usersService.searchUserByEmail(id);
    if (user.items.length === 0) {
      next(new ErrorResponse(parseInt(errCode.noId, 10), 401, errMsg.noId));
    }
    if (!bcrypt.compareSync(password, user.items[0].password)) {
      next(new ErrorResponse(parseInt(errCode.wrongPassword, 10), 403, errMsg.wrongPassword));
    }
    await authJwt.saveJwt(req, res, user.items[0]);
    res.status(204).send();
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 100 && errorCode < 200) {
      next(new ErrorResponse(errorCode, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
    }
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

export const intraAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) : Promise<void> => {
  try {
    const { intraProfile, id } = req.user as any;
    const { intraId, nickName } = intraProfile;
    const intraList: models.User[] = await usersService.searchUserByIntraId(intraId);
    if (intraList.length !== 0) {
      next(new ErrorResponse(parseInt(errCode.alreadyAuthenticated, 10), 401, errMsg.alreadyAuthenticated));
    }
    const user: { items: models.User[] } = await usersService.searchUserById(id);
    if (user.items.length === 0) {
      next(new ErrorResponse(parseInt(errCode.noUser, 10), 410, errMsg.noUser));
    }
    if (user.items[0].role !== role.user) {
      next(new ErrorResponse(parseInt(errCode.alreadyAuthenticated, 10), 401, errMsg.alreadyAuthenticated));
    }
    const affectedRow = await authService.updateAuthenticationUser(id, intraId, nickName);
    if (affectedRow === 0) {
      next(new ErrorResponse(parseInt(errCode.queryExecutionFailed, 10), 401, errMsg.queryExecutionFailed));
    }
    await authJwt.saveJwt(req, res, user.items[0]);
    res.status(200).send();
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 100 && errorCode < 200) {
      next(new ErrorResponse(errorCode, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
    }
  }
};

export const updateSlackList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) : Promise<void> => {
  try {
    await slack.updateSlackID();
    res.status(204).send();
  } catch (error: any) {
    const errorCode = parseInt(error.message, 10);
    if (errorCode >= 100 && errorCode < 200) {
      next(new ErrorResponse(errorCode, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(1, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(0, status.INTERNAL_SERVER_ERROR));
    }
  }
};
