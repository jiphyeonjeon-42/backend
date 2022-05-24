import { executeQuery } from '../mysql';
import * as models from './users.model';
import * as types from './users.type';

export const searchUserByNickName = async (nickName: string, limit: number, page: number) => {
  const items = (await executeQuery(`
    SELECT 
    SQL_CALC_FOUND_ROWS
    *
    FROM user
    WHERE nickName LIKE ?
    LIMIT ?
    OFFSET ?;
  `, [`%${nickName}%`, limit, limit * page])) as models.User[];
  const total = (await executeQuery(`
  SELECT FOUND_ROWS() as totalItems;
  `));
  const meta: types.Meta = {
    totalItems: total[0].totalItems,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(total[0].totalItems / limit),
    currentPage: page + 1,
  };
  return { items, meta };
};

export const searchUserById = async (id: number) => {
  const items = (await executeQuery(`
    SELECT 
    *
    FROM user
    WHERE id=?;
  `, [id])) as models.User[];
  return { items };
};

export const searchUserByEmail = async (email: string) => {
  const items = (await executeQuery(`
    SELECT 
    *
    FROM user
    WHERE email LIKE ?;
  `, [email])) as models.User[];
  return { items };
};

export const searchUserByIntraId = async (intraId: number) => {
  const result = (await executeQuery(`
    SELECT *
    FROM user
    WHERE
      intraId = ?
  `, [intraId])) as models.User[];
  return result;
};

export const searchAllUsers = async (limit: number, page: number) => {
  const items = (await executeQuery(`
    SELECT
    SQL_CALC_FOUND_ROWS
    *
    FROM user
    LIMIT ?
    OFFSET ?;
  `, [limit, limit * page])) as models.User[];
  const total = (await executeQuery(`
  SELECT FOUND_ROWS() as totalItems;
  `));
  const meta: types.Meta = {
    totalItems: total[0].totalItems,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(total[0].totalItems / limit),
    currentPage: page + 1,
  };
  return { items, meta };
};

export const createUser = async (email: string, password: string) => {
  await executeQuery(`
    INSERT INTO user(
      email, password, nickName
    )
    VALUES (
      ?, ?, ?
    );
  `, [email, password, '']);
  return null;
};

export const updateUserEmail = async (id: number, email:string) => {
  await executeQuery(`
  UPDATE user 
  SET email = ?
  WHERE id = ?;
  `, [email, id]);
};

export const updateUserPassword = async (id: number, password: string) => {
  await executeQuery(`
  UPDATE user
  SET password = ? 
  WHERE id = ?;
  `, [password, id]);
};

export const updateUserAuth = async (
  id: number,
  nickname: string,
  intraId: number,
  slack: string,
  role: number,
) => {
  let setString = '';
  const queryParameters = [];
  if (nickname !== '') {
    setString += 'nickname=?,';
    queryParameters.push(nickname);
  } if (intraId) {
    setString += 'intraId=?,';
    queryParameters.push(nickname);
  } if (slack !== '') {
    setString += 'slack=?,';
    queryParameters.push(slack);
  } if (role !== -1) {
    setString += 'role=?,';
    queryParameters.push(role);
  }
  setString = setString.slice(0, -1);
  queryParameters.push(id);
  await executeQuery(`
  UPDATE user 
  SET
  ${setString}
  where id=?
  `, queryParameters);
};
