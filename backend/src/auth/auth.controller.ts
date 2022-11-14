import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as status from 'http-status';
import config from '../config';
import * as usersService from '../users/users.service';
import * as authService from './auth.service';
import * as authJwt from './auth.jwt';
import * as models from '../users/users.model';
import { role } from './auth.type';
import { updateSlackIdByUserId } from '../slack/slack.service';
import ErrorResponse from '../utils/error/errorResponse';
import { logger } from '../utils/logger';
import * as errorCode from '../utils/error/errorCode';

export const getOAuth = (req: Request, res: Response) => {
  const clientId = config.client.id;
  const redirectURL = `${config.client.redirectURL}/api/auth/token`;
  const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectURL,
  )}&response_type=code&`;
  res.status(302).redirect(oauthUrl);
};

export const getToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, nickName } = req.user as any;
    const user: models.User[] = await usersService.searchUserByIntraId(id);
    if (user.length === 0) {
      // 회원가입
      try {
        const email = `${nickName}@student.42seoul.kr`;
        const password = Math.random().toString(36).slice(2); // 랜덤 비밀번호 설정
        await usersService.createUser(String(email), await bcrypt.hash(String(password), 10));
        const newUser: { items: models.User[] } = await usersService.searchUserByEmail(email);
        await authService.updateAuthenticationUser(newUser.items[0].id, id, nickName);
        await updateSlackIdByUserId(newUser.items[0].id);
        await authJwt.saveJwt(req, res, newUser.items[0]);
      } catch (error: any) {
        const errorNumber = parseInt(error.message ? error.message : error.errorCode, 10);
        if (errorNumber === 203) {
          res.status(status.BAD_REQUEST).send(`<script type="text/javascript">window.location="${config.client.clientURL}/register?errorCode=${errorCode.EMAIL_OVERLAP}"</script>`);
          return;
        }
        res.status(status.SERVICE_UNAVAILABLE).send(`<script type="text/javascript">window.location="${config.client.clientURL}/register?errorCode=${errorCode.UNKNOWN_ERROR}"</script>`);
        return;
      }
    } else { await authJwt.saveJwt(req, res, user[0]); }
    res.status(302).redirect(`${config.client.clientURL}/auth`);
  } catch (error: any) {
    const errorNumber = parseInt(error.message ? error.message : error.errorCode, 10);
    if (errorNumber === 101) {
      next(new ErrorResponse(error.message, status.UNAUTHORIZED));
    } else if (errorNumber >= 100 && errorNumber < 200) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.user as any;
    const user: { items: models.User[] } = await usersService.searchUserById(id);
    if (user.items.length === 0) {
      throw new ErrorResponse(errorCode.NO_USER, 410);
    }
    const result = {
      id: user.items[0].id,
      intra: user.items[0].nickname ? user.items[0].nickname : user.items[0].email,
      librarian: user.items[0].role === 2,
      email: user.items[0].email,
    };
    res.status(status.OK).json(result);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 100 && errorNumber < 300) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  }
};

// eslint-disable-next-line consistent-return
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, password } = req.body;
    if (!id || !password) {
      throw new ErrorResponse(errorCode.NO_INPUT, 400);
    }
    /* 여기에 id, password의 유효성 검증 한번 더 할 수도 있음 */
    const user: { items: models.User[] } = await usersService.searchUserByEmail(id);
    if (user.items.length === 0) {
      return next(new ErrorResponse(errorCode.NO_ID, 401));
    }
    if (!bcrypt.compareSync(password, user.items[0].password)) {
      return next(new ErrorResponse(errorCode.WRONG_PASSWORD, 403));
    }
    await authJwt.saveJwt(req, res, user.items[0]);
    res.status(204).send();
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 100 && errorNumber < 200) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
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
  // const redirectURL = `${config.client.redirectURL}/api/auth/token`;
  const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectURL,
  )}&response_type=code`;
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
    const user: { items: models.User[] } = await usersService.searchUserById(id);
    if (user.items.length === 0) {
      res.status(status.BAD_REQUEST)
        .send(`<script type="text/javascript">window.location="${config.client.clientURL}/mypage?errorCode=${errorCode.NO_USER}"</script>`);
      return;
      // return next(new ErrorResponse(errorCode.NO_USER, 410));
    }
    if (user.items[0].role !== role.user) {
      res.status(status.BAD_REQUEST)
        .send(`<script type="text/javascript">window.location="${config.client.clientURL}/mypage?errorCode=${errorCode.ALREADY_AUTHENTICATED}"</script>`);
      // return next(new ErrorResponse(errorCode.ALREADY_AUTHENTICATED, 401));
    }
    const intraList: models.User[] = await usersService.searchUserByIntraId(intraId);
    if (intraList.length !== 0) {
      res.status(status.BAD_REQUEST)
        .send(`<script type="text/javascript">window.location="${config.client.clientURL}/mypage?errorCode=${errorCode.ANOTHER_ACCOUNT_AUTHENTICATED}"</script>`);
      return;
      // return next(new ErrorResponse(errorCode.ALREADY_AUTHENTICATED, 401));
    }
    const affectedRow = await authService.updateAuthenticationUser(id, intraId, nickName);
    if (affectedRow === 0) {
      res.status(status.BAD_REQUEST)
        .send(`<script type="text/javascript">window.location="${config.client.clientURL}/mypage?errorCode=${errorCode.NON_AFFECTED}"</script>`);
      // return next(new ErrorResponse(errorCode.NON_AFFECTED, 401));
    }
    await updateSlackIdByUserId(user.items[0].id);
    await authJwt.saveJwt(req, res, user.items[0]);
    res.status(status.OK)
      .send(`<script type="text/javascript">window.location="${config.client.clientURL}/mypage?errorCode=${errorCode.INTRA_AUTHENTICATE_SUCCESS}"</script>`);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 100 && errorNumber < 200) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  }
};
