import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import ErrorResponse from '../errorResponse';
import { User } from './users.model';
import {
  createUser,
  searchAllUsers, searchUserByNickName, updateUserAuth,
  updateUserEmail, updateUserPassword, userReservations,
} from './users.service';

export const search = async (
  req: Request,
  res: Response,
) => {
  const { nickName = '', page = '1', limit = '5' } = req.query;
  try {
    if (parseInt(String(limit), 10) > 0 && parseInt(String(page), 10) >= 0) {
      let items;
      if (nickName === '') {
        items = await searchAllUsers(parseInt(String(limit), 10), parseInt(String(page), 10));
      } else if (nickName) {
        items = JSON.parse(JSON.stringify(await
        searchUserByNickName(
          String(nickName),
          parseInt(String(limit), 10),
          parseInt(String(page), 10),
        )));
      } else throw new ErrorResponse(201, 'nickname is NULL');
      if (items) {
        items.items = await Promise.all(items.items.map(async (data: User) => ({
          ...data,
          reservations:
              await userReservations(data.id),
        })));
      }
      res.send(items);
    } else if (parseInt(String(limit), 10) <= 0) throw new ErrorResponse(200, 'limit is invalid');
    else if (parseInt(String(page), 10) < 0) throw new ErrorResponse(200, 'Page is Invalid');
  } catch (error:any) {
    if (error instanceof ErrorResponse) {
      res.status(400).send(error.message);
    } else if (error.message === 'DB error') {
      res.status(500).send(error.message);
    }
  }
};

export const create = async (req: Request, res: Response) => {
  const { email, password } = req.query;
  try {
    if (email && password) createUser(String(email), await bcrypt.hash(String(password), 10));
    else if (!email) throw new ErrorResponse(201, 'Email is NULL');
    else if (!password) throw new ErrorResponse(201, 'Password is NULL');
  } catch (error: any) {
    if (error instanceof ErrorResponse) {
      res.status(400).send(error.message);
    } else if (error.message === 'DB error') {
      res.status(500).send(error.message);
    }
  }
};

export const update = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const {
    nickname = '', intraId = '0', slack = '', role = '-1',
  } = req.body;
  try {
    if (id) {
      if (nickname !== '' || intraId || slack !== '' || role !== '-1') {
        updateUserAuth(
          parseInt(id, 10),
          nickname,
          parseInt(intraId, 10),
          slack,
          parseInt(role, 10),
        );
        res.status(200).send('success');
      } else throw new ErrorResponse(202, 'Insufficient arguments');
    } else throw new ErrorResponse(201, 'Id is NULL');
  } catch (error: any) {
    if (error instanceof ErrorResponse) {
      res.status(400).send(error.message);
    } else if (error.message === 'DB error') {
      res.status(500).send(error.message);
    }
  }
};

export const myupdate = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const {
    email = '', password = '0',
  } = req.body;
  try {
    if (id) {
      if (email !== '') {
        updateUserEmail(parseInt(id, 10), email);
      } else if (password !== '') {
        const encryptedPW = bcrypt.hashSync(password, 10);
        updateUserPassword(parseInt(id, 10), encryptedPW);
      } else { throw new ErrorResponse(202, 'Insufficient arguments'); }
      res.status(200).send('success');
    } else throw new ErrorResponse(201, 'Id is NULL');
  } catch (error: any) {
    if (error instanceof ErrorResponse) {
      res.status(400).send(error.message);
    } else if (error.message === 'DB error') {
      res.status(500).send(error.message);
    }
  }
};
