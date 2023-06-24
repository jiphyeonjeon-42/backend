import { DataSource, DataSourceOptions } from 'typeorm';
import { connectOption } from './config';

export const option: DataSourceOptions = {
  type: 'mysql',
  port: 3306,
  ...connectOption,
  entities: [
    `${__dirname}/**/entities/*.{js,ts}`,
  ],
  logging: true,
  //  synchronize: true,
  poolSize: 200,
};
console.log(__dirname);
const jipDataSource = new DataSource(option);

export default jipDataSource;
