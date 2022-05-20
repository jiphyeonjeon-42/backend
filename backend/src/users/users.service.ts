import { executeQuery } from '../mysql';
import * as models from './users.model';

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
  const meta: models.Meta = {
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
  SELECT FOUND_ROWS() as to
  talItems;
  `));
  const meta: models.Meta = {
    totalItems: total[0].totalItems,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(total[0].totalItems / limit),
    currentPage: page + 1,
  };
  return { items, meta };
};
/*
export const createUser = async (ftUserInfo: FtTypes): Promise<models.User> => {
  await executeQuery(`
    INSERT INTO user(
      login, intra
    )
    VALUES (
      ?, ?
    );
  `, [ftUserInfo.login, ftUserInfo.intra]);
  const result = (await executeQuery(`
    SELECT *
      FROM user
    WHERE
      login = ?
    ;
  `, [ftUserInfo.login])) as models.User[];
  const user = result[0];
  user.imageURL = ftUserInfo.imageURL;
  return user;
};
*/
export const deleteUserById = async (id: string): Promise<boolean> => {
  const result = (await executeQuery(`
    SELECT *
    FROM user
    WHERE id = ?
  `, [id])) as models.User[];
  if (result?.length === 0) return false;
  await executeQuery(`
    DELETE FROM user
    WHERE id = ?
  `, [id]);
  return true;
};

// 없어질 함수입니다. 다른 함수로 바꾸세요 searchUsersById 추천
export const identifyUserById = async (id: number): Promise<models.User> => {
  const result = (await executeQuery(`
    SELECT *
      FROM user
    WHERE
      id = ?
    LIMIT 1;
  `, [id])) as models.User[];
  return result[0];
};
// export const searchByLogin = async (login: string, page: number, limit: number) => {};
