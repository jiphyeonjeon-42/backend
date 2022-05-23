import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import {
  createUser, searchAllUsers, searchUserByNickName,
  updateUserAuth, updateUserEmail, updateUserPassword,
} from './users.service';
import { createQuery, searchQuery, updateQuery } from './users.type';

export const search = async (
  req: Request<{}, {}, {}, searchQuery>,
  res: Response,
) => {
  const { nickName = '', page = '1', limit = '5' } = req.query;
  if (parseInt(limit, 10) > 0 && parseInt(page, 10) >= 0) {
    if (nickName === '') {
      res.send(searchAllUsers(parseInt(page, 10), parseInt(limit, 10)));
    } else if (nickName) {
      const items = JSON.parse(JSON.stringify(await
      searchUserByNickName(nickName, parseInt(limit, 10), parseInt(page, 10))));
      res.send(items);
    } else res.status(400).send('NickName is NULL');
  } else if (parseInt(limit, 10) <= 0) res.status(400).send('Limit is Invalid');
  else if (parseInt(page, 10) < 0) res.status(400).send('Page is Invalid');
};

export const update = async (
  req: Request<{}, {}, {}, updateQuery>,
  res: Response,
) => {
  const {
    id, email = '', password = '', nickname = '', intraId = null, slack = '', role = -1,
  } = req.query;
  if (id) {
    if (email !== '') updateUserEmail(id, email);
    else if (password !== '') updateUserPassword(id, password);
    else if (nickname !== '' && intraId && slack !== '' && role !== -1) updateUserAuth(id, nickname, intraId, slack, role);
    else res.status(400).send('Insufficient arguments');
  } else res.status(401).send('Id is invalid');
};

export const create = async (req: Request<{}, {}, {}, createQuery>, res: Response) => {
  const { email, password } = req.query;
  if (email && password) createUser(email, await bcrypt.hash(password, 10));
  else if (!email) res.status(400).send('Email is NULL');
  else if (!password) res.status(400).send('Password is NULL');
};
