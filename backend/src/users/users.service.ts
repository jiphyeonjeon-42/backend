import { FtTypes } from '../auth/auth.service';
import { executeQuery, pool } from '../mysql';

export interface User {
  id: number,
  login: string,
  intra: number,
  slack?: string,
  penaltyAt?: Date,
  librarian?: number,
  createdAt?: Date,
  updatedAt?: Date,
  imageURL?: string,
}

export const identifyUserByLogin = async (login: string) => {
  const rows = (await executeQuery(`
    SELECT *
      FROM user
    WHERE
      login = ?
  `, [login])) as User[];
  return rows[0];
};

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

export const deleteUserByIntra = async (intra: number): Promise<boolean> => {
  const result = (await executeQuery(`
    SELECT *
    FROM user
    WHERE intra = ?
  `, [intra])) as User[];
  if (result?.length === 0) return false;
  await executeQuery(`
    DELETE FROM user
    WHERE intra = ?
  `, [intra]);
  return true;
};

// export const searchByLogin = async (login: string, page: number, limit: number) => {};
