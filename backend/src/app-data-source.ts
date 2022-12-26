import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const jipDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MODE === 'local' ? 'localhost' : 'database',
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [
    '**/entity/*.ts',
  ],
  logging: [
    'query',
    'error',
  ],
  poolSize: 200,
});

export default jipDataSource;
