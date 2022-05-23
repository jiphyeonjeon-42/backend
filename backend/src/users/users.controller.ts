import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import * as usersService
  from './users.service';
import { createQuery, searchQuery, updateQuery } from './users.type';

export const search = async (
  req: Request<{}, {}, {}, searchQuery>,
  res: Response,
) => {
  const { nickName = '', page = '1', limit = '5' } = req.query;
  if (nickName === '') {
    res.send(usersService.searchAllUsers(parseInt(page, 10), parseInt(limit, 10)));
  } else if (nickName) {
    const items = JSON.parse(JSON.stringify(await
    usersService.searchUserByNickName(nickName, parseInt(limit, 10), parseInt(page, 10))));
    res.send(items);
  }
};

export const update = async (
  req: Request<{}, {}, {}, updateQuery>,
) => {
  const {
    id, email = '', password = '', nickname = '', intraId = null, slack = '', role = -1,
  } = req.query;
  if (email !== '') {
    usersService.updateUserEmail(id, email);
  } else if (password !== '') {
    usersService.updateUserPassword(id, password);
  } else if (nickname !== '' && intraId && slack !== '' && role !== -1) {
    usersService.updateUserAuth(id, nickname, intraId, slack, role);
  } else {
    // 나중에 에러처리 추가
    // 나중에 코드찍고 메세지 보내기
  }
};

export const create = async (req: Request<{}, {}, {}, createQuery>) => {
  const { email, password } = req.query;
  usersService.createUser(email, await bcrypt.hash(password, 10));
};
