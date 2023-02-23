import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import PasswordValidator from 'password-validator';
import * as status from 'http-status';
import ErrorResponse from '../utils/error/errorResponse';
import { User } from './users.model';
import {
  createUser,
  searchAllUsers, searchUserById, searchUserBynicknameOrEmail, updateUserAuth,
  updateUserEmail, updateUserPassword, userReservations,
} from './users.service';
import { logger } from '../utils/logger';
import * as errorCode from '../utils/error/errorCode';

export const search = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = String(req.query.id) !== 'undefined' ? parseInt(String(req.query.id), 10) : 0;
  const nicknameOrEmail = String(req.query.nicknameOrEmail) !== 'undefined' ? String(req.query.nicknameOrEmail) : '';
  const page = parseInt(String(req.query.page), 10) ? parseInt(String(req.query.page), 10) : 0;
  const limit = parseInt(String(req.query.limit), 10) ? parseInt(String(req.query.limit), 10) : 5;
  let items;

  if (limit <= 0 || page < 0) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    if (nicknameOrEmail === '' && id === 0) {
      items = await searchAllUsers(limit, page);
    } else if (nicknameOrEmail !== '' && id === 0) {
      items = JSON.parse(JSON.stringify(
        await searchUserBynicknameOrEmail(nicknameOrEmail, limit, page),
      ));
    } else if (nicknameOrEmail === '' && id !== 0) {
      items = JSON.parse(JSON.stringify(
        await searchUserById(id),
      ));
    }
    if (items) {
      items.items = await Promise.all(items.items.map(async (data: User) => ({
        ...data,
        reservations:
          await userReservations(data.id),
      })));
    }
    return res.json(items);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 200 && errorNumber < 300) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  }
  return 0;
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const pwSchema = new PasswordValidator();
  if (!email || !password) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    pwSchema
      .is().min(10)
      .is().max(42) /* eslint-disable-next-line newline-per-chained-call */
      .has().digits(1) /* eslint-disable-next-line newline-per-chained-call */
      .symbols(1);
    if (!pwSchema.validate(String(password))) {
      return next(new ErrorResponse(errorCode.INVALIDATE_PASSWORD, status.BAD_REQUEST));
    }
    await createUser(String(email), await bcrypt.hash(String(password), 10));
    return res.status(status.OK).send(`${email} created!`);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 200 && errorNumber < 300) {
      if (errorNumber === 206) next(new ErrorResponse(error.message, status.FORBIDDEN));
      else if (errorNumber === 203) next(new ErrorResponse(error.message, status.CONFLICT));
      else next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  }
  return 0;
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const {
    nickname = '', intraId = 0, slack = '', role = -1, penaltyEndDate = '',
  } = req.body;
  if (!id || !(nickname !== '' || intraId !== 0 || slack !== '' || role !== -1 || penaltyEndDate !== '')) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    const updatedUser = await updateUserAuth(
      parseInt(id, 10),
      nickname,
      intraId,
      slack,
      role,
      penaltyEndDate,
    );
    return res.status(200).json(updatedUser);
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 200 && errorNumber < 300) {
      if (errorNumber === 204) {
        return next(new ErrorResponse(error.message, status.CONFLICT));
      }
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
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
  if (email === '' && password === '0') {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }
  try {
    if (email !== '' && password === '0') {
      await updateUserEmail(parseInt(tokenId, 10), email);
    } else if (email === '' && password !== '0') {
      const pwSchema = new PasswordValidator();
      pwSchema
        .is().min(10)
        .is().max(42) /* eslint-disable-next-line newline-per-chained-call */
        .has().lowercase() /* eslint-disable-next-line newline-per-chained-call */
        .has().digits(1) /* eslint-disable-next-line newline-per-chained-call */
        .symbols(1);
      if (!pwSchema.validate(password)) {
        return next(new ErrorResponse(errorCode.INVALIDATE_PASSWORD, status.BAD_REQUEST));
      }
      await updateUserPassword(parseInt(tokenId, 10), bcrypt.hashSync(password, 10));
    } res.status(200).send('success');
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 200 && errorNumber < 300) {
      if (errorNumber === 206) {
        return next(new ErrorResponse(error.message, status.FORBIDDEN));
      }
      if (errorNumber === 204) {
        return next(new ErrorResponse(error.message, status.CONFLICT));
      }
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.QUERY_EXECUTION_FAILED, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error);
      next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
    }
  }
  return 0;
};
