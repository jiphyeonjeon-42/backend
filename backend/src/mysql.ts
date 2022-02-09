import mysql from 'mysql2';
import config from './config';

const connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.username,
  password: config.database.password,
  database: config.database.dbName,
});

connection.connect();

export default connection;
