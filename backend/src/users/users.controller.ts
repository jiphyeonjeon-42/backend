import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import PasswordValidator from 'password-validator';
import * as status from 'http-status';
import ErrorResponse from '../utils/error/errorResponse';
import { User } from './users.model';
import {
  createUser,
  searchAllUsers, searchUserByNickName, updateUserAuth,
  updateUserEmail, updateUserPassword, userReservations,
} from './users.service';
import { logger } from '../utils/logger';
import * as errorCode from '../utils/error/errorCode';

export const search = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const nickname = String(req.query.nickname) ? String(req.query.nickname) : '';
  const page = parseInt(String(req.query.page), 10) ? parseInt(String(req.query.page), 10) : 0;
  const limit = parseInt(String(req.query.limit), 10) ? parseInt(String(req.query.limit), 10) : 5;
  let items;

  if (limit <= 0 || page < 0) next(new ErrorResponse(errorCode.invalidInput, status.BAD_REQUEST));
  try {
    if (nickname === '') {
      items = await searchAllUsers(limit, page);
    } else if (nickname) {
      items = JSON.parse(JSON.stringify(
        await searchUserByNickName(nickname, limit, page),
      ));
    }
    if (items) {
      items.items = await Promise.all(items.items.map(async (data: User) => ({
        ...data,
        reservations:
          await userReservations(data.id),
      })));
    }
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 200 && errorNumber < 300) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.queryExecutionFailed, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(errorCode.unknownError, status.INTERNAL_SERVER_ERROR));
    }
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const pwSchema = new PasswordValidator();
  if (!email || !password) next(new ErrorResponse(errorCode.invalidInput, status.BAD_REQUEST));
  try {
    pwSchema
      .is().min(10)
      .is().max(42) /* eslint-disable-next-line newline-per-chained-call */
      .has().digits(1) /* eslint-disable-next-line newline-per-chained-call */
      .symbols(1);
    if (!pwSchema.validate(String(password))) throw new Error(errorCode.invalidatePassword);
    await createUser(String(email), await bcrypt.hash(String(password), 10));
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 200 && errorNumber < 300) {
      if (errorNumber === 206) next(new ErrorResponse(error.message, status.FORBIDDEN));
      else if (errorNumber === 203) next(new ErrorResponse(error.message, status.CONFLICT));
      else next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.queryExecutionFailed, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(errorCode.unknownError, status.INTERNAL_SERVER_ERROR));
    }
  }
  res.status(status.OK).send(`${email} created!`);
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const {
    nickname = '', intraId = '0', slack = '', role = '-1',
  } = req.body;
  if (!id) next(new ErrorResponse(errorCode.invalidInput, status.BAD_REQUEST));
  if (nickname === '' || !intraId || slack === '' || role === '-1') next(new ErrorResponse(errorCode.invalidInput, status.BAD_REQUEST));
  try {
    await updateUserAuth(
      parseInt(id, 10),
      nickname,
      parseInt(intraId, 10),
      slack,
      parseInt(role, 10),
    );
    return res.status(204).send('success');
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 200 && errorNumber < 300) {
      if (errorNumber === 206) next(new ErrorResponse(error.message, status.FORBIDDEN));
      if (errorNumber === 204) next(new ErrorResponse(error.message, status.CONFLICT));
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.queryExecutionFailed, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(errorCode.unknownError, status.INTERNAL_SERVER_ERROR));
    }
  }
  return 0;
};

export const myupdate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: tokenId } = req.user as any;
  const {
    email = '', password = '0',
  } = req.body;
  if (email === '' && password === '0') next(new ErrorResponse(errorCode.invalidInput, status.BAD_REQUEST));
  try {
    if (email !== '' && password === '0') {
      updateUserEmail(parseInt(tokenId, 10), email);
    } else if (email === '' && password !== '0') {
      const pwSchema = new PasswordValidator();
      pwSchema
        .is().min(10)
        .is().max(42) /* eslint-disable-next-line newline-per-chained-call */
        .has().lowercase() /* eslint-disable-next-line newline-per-chained-call */
        .has().digits(1) /* eslint-disable-next-line newline-per-chained-call */
        .symbols(1);
      if (!pwSchema.validate(password)) res.status(400).send({ errCode: 205 });
      else updateUserPassword(parseInt(tokenId, 10), bcrypt.hashSync(password, 10));
    } res.status(200).send('success');
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 200 && errorNumber < 300) {
      if (errorNumber === 206) next(new ErrorResponse(error.message, status.FORBIDDEN));
      if (errorNumber === 204) next(new ErrorResponse(error.message, status.CONFLICT));
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.queryExecutionFailed, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(errorCode.unknownError, status.INTERNAL_SERVER_ERROR));
    }
  }
};
