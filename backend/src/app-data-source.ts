import { DataSource, DataSourceOptions } from 'typeorm';
import { connectMode, connectOption } from '~/config';
import * as entities from '~/entity/entities';
import { logger } from './logger';

export const option: DataSourceOptions = {
  type: 'mysql',
  port: 3306,
  ...connectOption,
  entities: Object.values(entities),
  logging: true,
  //  synchronize: true,
  poolSize: 200,
};
logger.info(__dirname);
const jipDataSource = new DataSource(option);
await jipDataSource.initialize().then(() => {
  logger.info('typeORM INIT SUCCESS');
  logger.info(connectMode);
});

export default jipDataSource;
