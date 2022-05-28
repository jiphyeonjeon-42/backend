import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
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
    } else res.status(400).send('NickName is NULL');
    if (items) {
      items.items = await Promise.all(items.items.map(async (data: User) => ({ ...data, reservations: await userReservations(data.id) })));
    }
    res.send(items);
  } else if (parseInt(String(limit), 10) <= 0) res.status(400).send('Limit is Invalid');
  else if (parseInt(String(page), 10) < 0) res.status(400).send('Page is Invalid');
};

export const create = async (req: Request, res: Response) => {
  const { email, password } = req.query;
  if (email && password) createUser(String(email), await bcrypt.hash(String(password), 10));
  else if (!email) res.status(400).send('Email is NULL');
  else if (!password) res.status(400).send('Password is NULL');
};

export const update = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const {
    nickname = '', intraId = '0', slack = '', role = '-1',
  } = req.body;
  if (id) {
    if (nickname !== '' || intraId || slack !== '' || role !== '-1') {
      updateUserAuth(parseInt(id, 10), nickname, parseInt(intraId, 10), slack, parseInt(role, 10));
      res.status(200).send('success');
    } else res.status(400).send('Insufficient arguments');
  } else res.status(401).send('Id is invalid');
};

export const myupdate = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const {
    email = '', password = '0',
  } = req.body;
  if (id) {
    if (email !== '') {
      updateUserEmail(parseInt(id, 10), email);
    } else if (password !== '') {
      const encryptedPW = bcrypt.hashSync(password, 10);
      updateUserPassword(parseInt(id, 10), encryptedPW);
    } else {
      res.status(400).send('Insufficient arguments');
    }
    res.status(200).send('success');
  } else res.status(401).send('Id is invalid');
};
