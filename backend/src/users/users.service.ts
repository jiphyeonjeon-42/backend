import { ftTypes } from '../auth/auth.service';
import { dbConnect } from '../mysql';

export const identifyOneByLogin = async (login: string) => {
  const connection = await dbConnect();
  const rows = await connection.query(`
    SELECT *
      FROM user
    WHERE
      login = ?
  `, [login]);
  console.log(rows);
  return rows;
};

export const identifyOneById = async (id: number) => {
  const connection = await dbConnect();
  const rows = await connection.query(`
    SELECT *
      FROM user
    WHERE
      id = ?
    LIMIT 1;
  `, [id]);
  return rows[0];
};

export const createUser = async (ftUserInfo: ftTypes) => {
  const connection = await dbConnect();
  await connection.query(`
    INSERT INTO user(
      login, intra,
    )
    VALUES (
      ?, ?
    )
  `, [ftUserInfo.login, ftUserInfo.intra]);
};

// export const searchByLogin = async (login: string, page: number, limit: number) => {};
