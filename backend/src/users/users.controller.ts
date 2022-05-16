import bcrypt from 'bcrypt';
import { Request,  Response } from 'express';
import { createUser, searchAllUsers, searchUserByNickName } from './users.service';

export interface searchQuery {
  nickName: string;
  page?: number;
  limit?: number;
}

export interface createQuery {
  email: string;
  password: string;
}

export const search = async (
  req: Request<{}, {}, {}, searchQuery>,
  res: Response,
) => {
  const { nickName = '', page = 1, limit = 5 } = req.query;
  if (nickName === '') {
    res.send(searchAllUsers(page, limit));
  } else if (nickName) {
    const items = JSON.parse(JSON.stringify(await searchUserByNickName(nickName, limit, page)));
    res.send(items);
  }
};

export const create = async (req: Request<{}, {}, {}, createQuery>) => {
  const { email, password } = req.query;
  createUser(email, await bcrypt.hash(password, 10));
};
