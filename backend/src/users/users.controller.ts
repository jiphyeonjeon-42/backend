import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import PasswordValidator from 'password-validator';
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
  const { nickname = '', page = '1', limit = '5' } = req.query;
  let items;
  try {
    if (parseInt(String(limit), 10) > 0 && parseInt(String(page), 10) >= 0) {
      if (nickname === '') {
        items = await searchAllUsers(parseInt(String(limit), 10), parseInt(String(page), 10));
      } else if (nickname) {
        items = JSON.parse(JSON.stringify(await
        searchUserByNickName(
          String(nickname),
          parseInt(String(limit), 10),
          parseInt(String(page), 10),
        )));
      } else res.status(400).send({ errCode: 201 });
      if (items) {
        items.items = await Promise.all(items.items.map(async (data: User) => ({
          ...data,
          reservations:
            await userReservations(data.id),
        })));
      }
    } else if (parseInt(String(limit), 10) <= 0) res.status(400).send({ errCode: 200 });
    else if (parseInt(String(page), 10) < 0) res.status(400).send({ errCode: 200 });
  } catch (error:any) {
    if (error.message === 'DB error') res.status(500).send(error.message);
    else if (error instanceof ErrorResponse) res.status(error.status).send(error.message);
    else res.status(404).send({ errCode: 0 });
  } res.status(200).send(items);
};

export const create = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const pwSchema = new PasswordValidator();
  try {
    pwSchema
      .is().min(10)
      .is().max(42) /* eslint-disable-next-line newline-per-chained-call */
      .has().digits(1) /* eslint-disable-next-line newline-per-chained-call */
      .symbols(1);
    if (!pwSchema.validate(String(password))) return res.status(400).send({ errCode: 205 });
    if (email && password) createUser(String(email), await bcrypt.hash(String(password), 10));
    else if (!email) res.status(400).send({ errCode: 205 });
    else if (!password) res.status(400).send({ errCode: 205 });
  } catch (error: any) {
    if (error instanceof ErrorResponse) {
      res.status(error.status).send(error.message);
    } else if (error.message === 'DB error') {
      res.status(500).send({ errCode: 1 });
    } else res.status(404).send({ errCode: 0 });
  }
  res.status(200).send(`${email} created!`);
};

export const update = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const {
    nickname = '', intraId = '0', slack = '', role = '-1',
  } = req.body;

  if (!id) return res.status(400).send({ errCode: 201 });
  if (nickname === '' || !intraId || slack === '' || role === '-1') return res.status(400).send({ errCode: 202 });
  try {
    updateUserAuth(
      parseInt(id, 10),
      nickname,
      parseInt(intraId, 10),
      slack,
      parseInt(role, 10),
    );
    return res.status(204).send('success');
  } catch (error: any) {
    if (error instanceof ErrorResponse) res.status(error.status).send(error.message);
    else if (error.message === 'DB error') res.status(500).send({ errCode: 1 });
    else res.status(404).send({ errCode: 0 });
  }
};

export const myupdate = async (
  req: Request,
  res: Response,
) => {
  const { id: tokenId } = req.user as any;
  const {
    email = '', password = '0',
  } = req.body;
  if (email === '' && password === '0') return res.status(400).send({ errCode: 202 });
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
    if (error instanceof ErrorResponse) {
      res.status(error.status).send(error.message);
    } else if (error.message === 'DB error') {
      res.status(500).send(error.message);
    } else {
      res.status(404).send({ errCode: 0 });
    }
  }
};
