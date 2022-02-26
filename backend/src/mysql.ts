import mysql from 'mysql2/promise';
import config from './config';

export const pool = mysql.createPool({
  host: config.database.host,
  port: 3306,
  user: config.database.username,
  password: config.database.password,
  database: config.database.dbName,
});

export const dbConnect = async () => {
  const connection = await pool.getConnection();
  return connection;
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
