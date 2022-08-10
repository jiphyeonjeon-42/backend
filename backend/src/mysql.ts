import mysql from 'mysql2/promise';
import { FieldPacket } from 'mysql2';
import config from './config';
import { logger } from './utils/logger';

export const DBError = 'DB error';

export const pool = mysql.createPool({
  host: config.database.host,
  port: 3306,
  user: config.database.username,
  password: config.database.password,
  database: config.database.dbName,
});

export const executeQuery = async (queryText: string, values: any[] = []): Promise<any> => {
  const connection = await pool.getConnection();
  logger.debug(`Executing query: ${queryText} (${values})`);
  let result;
  try {
    const queryResult: [
      any,
      FieldPacket[]
    ] = await connection.query(queryText, values);
    [result] = queryResult;
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e);
      throw new Error('DB error');
    }
    throw e;
  } finally {
    connection.release();
  }
  return result;
};

export const makeExecuteQuery = (connection: mysql.PoolConnection) => async (
  queryText: string,
  values: any[] = [],
): Promise<any> => {
  logger.debug(`Executing query: ${queryText} (${values})`);
  let result;
  try {
    const queryResult: [
        any,
        FieldPacket[]
    ] = await connection.query(queryText, values);
    [result] = queryResult;
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e);
      throw new Error(DBError);
    }
    throw e;
  }
  return result;
};

type lending = {
  lendingId: number;
}

type UserRow = {
  userId: number;
  lending: lending[];
}

export const queryTest = async () => {
  const connection = await pool.getConnection();
  const rows = await connection.query(`
    SELECT
      id AS userId
    FROM
      user
    LIMIT 50;
  `) as unknown as UserRow[][];
  const newRows = Promise.all(rows[0].map(async (row) => {
    const lendings = await connection.query(`
      SELECT
        id AS lendingId
      FROM
        lending
      WHERE
        userId = ?
    `, [row.userId]) as unknown as lending[][];
    const newRow = row;
    [newRow.lending] = lendings;
    // eslint-disable-next-line no-console
    console.log(lendings[0]);
    return newRow;
  }));

  // eslint-disable-next-line no-console
  console.log(newRows);
};
