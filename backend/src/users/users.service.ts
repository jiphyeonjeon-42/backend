import { FtTypes } from '../auth/auth.service';
import { dbConnect } from '../mysql';

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
  const connection = await dbConnect();
  const rows = (await connection.query(`
    SELECT *
      FROM user
    WHERE
      login = ?
  `, [login]))[0] as unknown as User[];
  return rows[0];
};

export const identifyUserById = async (id: number): Promise<User> => {
  const connection = await dbConnect();
  const result = (await connection.query(`
    SELECT *
      FROM user
    WHERE
      id = ?
    LIMIT 1;
  `, [id]))[0] as unknown as User[];
  return result[0];
};

export const createUser = async (ftUserInfo: FtTypes): Promise<User> => {
  const connection = await dbConnect();
  await connection.query(`
    INSERT INTO user(
      login, intra
    )
    VALUES (
      ?, ?
    );
  `, [ftUserInfo.login, ftUserInfo.intra]);
  const result = (await connection.query(`
    SELECT *
      FROM user
    WHERE
      login = ?
    ;
  `, [ftUserInfo.login]))[0] as unknown as User[];
  const user = result[0];
  user.imageURL = ftUserInfo.imageURL;
  return user;
};

export const deleteUserByIntra = async (intra: number): Promise<boolean> => {
  const connection = await dbConnect();
  const result = (await connection.query(`
    SELECT *
    FROM user
    WHERE intra = ?
  `, [intra]))[0] as unknown as User[];
  if (result.length === 0) return false;
  connection.query(`
    DELETE FROM user
    WHERE intra = ?
  `, [intra]);
  return true;
};

// export const searchByLogin = async (login: string, page: number, limit: number) => {};
