import { envObject } from './envObject';

/** RDS 연결 옵션 파싱을 위한 스키마 */
export const rdsSchema = envObject('RDS_HOSTNAME', 'RDS_USERNAME', 'RDS_PASSWORD', 'RDS_DB_NAME')
  .transform(({
    RDS_HOSTNAME, RDS_USERNAME, RDS_PASSWORD, RDS_DB_NAME,
  }) => ({
    host: RDS_HOSTNAME,
    username: RDS_USERNAME,
    password: RDS_PASSWORD,
    database: RDS_DB_NAME,
  }));

/** MYSQL 연결 옵션 파싱을 위한 스키마 */
const mysqlSchema = envObject('MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE')
  .transform(({ MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE }) => ({
    username: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  }));

/** MYSQL 로컬 환경 연결 옵션 파싱을 위한 스키마 */
export const localSchema = mysqlSchema.transform((args) => ({ ...args, host: 'localhost' as const }));

/** MYSQL 배포 환경 연결 옵션 파싱을 위한 스키마 */
export const prodSchema = mysqlSchema.transform((args) => ({ ...args, host: 'database' as const }));
