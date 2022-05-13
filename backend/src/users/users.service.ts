import { FtTypes } from '../auth/auth.service';
import { executeQuery, pool } from '../mysql';

export interface User {
  id: string,
  IntraId: string,
  IntraKey: number,
  slack?: string,
  penaltyEndDay?: Date,
  role: number,
  lendingCnt?: number,
  reservations?: [],
  lendings?: [],
}

export const searchUserById = async (Id: string) => {
  const rows = (await executeQuery(`
    SELECT *
      FROM user
    WHERE
      IntraKey = ?
  `, [Id])) as User[];
  return rows[0];
};

export const searchAllUsers = async (limit: number, page: number): Promise<User> => {
  const result = (await executeQuery(`
    SELECT *
      FROM user
    LIMIT ?
    OFFSET ?;
  `, [limit, limit * page])) as User[];
  return result[0];
};

export const searchUserByIntraKey = async (IntraKey: number): Promise<User> => {
  const result = (await executeQuery(`
    SELECT *
      FROM user
    WHERE
      IntraKey = ?
  `, [IntraKey])) as User[];
  return result[0];
};
/*
export const identifyUserById = async (id: number): Promise<User> => {
  const result = (await executeQuery(`
    SELECT *
      FROM user
    WHERE
      id = ?
    LIMIT 1;
  `, [id])) as User[];
  return result[0];
};

export const createUser = async (ftUserInfo: FtTypes): Promise<User> => {
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
  `, [ftUserInfo.login])) as User[];
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
  `, [id])) as User[];
  if (result?.length === 0) return false;
  await executeQuery(`
    DELETE FROM user
    WHERE id = ?
  `, [id]);
  return true;
};

// export const searchByLogin = async (login: string, page: number, limit: number) => {};
