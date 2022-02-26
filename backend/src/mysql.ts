import mysql from 'mysql2/promise';
import { configs } from './config';

const pool = mysql.createPool({
  host: configs.database.host,
  user: configs.database.username,
  password: configs.database.password,
  database: configs.database.dbName,
});

export { pool };
