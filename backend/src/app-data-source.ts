import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

let hostName;
let username;
let password;
let database;

switch (process.env.MODE) {
  case 'local':
    hostName = 'localhost';
    username = process.env.MYSQL_USER;
    password = process.env.MYSQL_PASSWORD;
    database = process.env.MYSQL_DATABASE;
    break;
  case 'RDS':
    hostName = process.env.RDS_HOSTNAME;
    username = process.env.RDS_USERNAME;
    password = process.env.RDS_PASSWORD;
    database = process.env.RDS_DB_NAME;
    break;
  case 'prod':
    hostName = 'database';
    username = process.env.MYSQL_USER;
    password = process.env.MYSQL_PASSWORD;
    database = process.env.MYSQL_DATABASE;
}

export const option = {
  type: 'mysql',
  host: hostName,
  port: 3306,
  username,
  password,
  database,
  entities: [
    `${__dirname}/../**/entities/*.{js,ts}`,
  ],
  logging: true,
  // poolSize: 500,
//  synchronize: true,
  poolSize: 200,
} as DataSourceOptions;
console.log(__dirname);
const jipDataSource = new DataSource(option);

export default jipDataSource;
