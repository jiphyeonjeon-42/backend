import mysql from 'mysql2/promise';
import { FieldPacket } from 'mysql2';
import config from './config';
import { logger } from './utils/logger';

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
  const [result]: [
    any,
    FieldPacket[]
  ] = await connection.query(queryText, values);
  connection.release();
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
    console.log(lendings[0]);
    return newRow;
  }));

  console.log(newRows);
};
