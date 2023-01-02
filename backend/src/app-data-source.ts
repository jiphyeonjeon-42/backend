import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

let hostName;
let username;
let password;
let database;

switch (process.env.MODE) {
  case 'local':
    hostName = 'local';
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
  default:
    hostName = 'database';
}

const jipDataSource = new DataSource({
  type: 'mysql',
  host: hostName,
  port: 3306,
  username,
  password,
  database,
  entities: [
    '**/entity/entities/*.ts',
  ],
  logging: true,
  //poolSize: 500,
  synchronize: true,
  poolSize: 200,
});

export default jipDataSource;