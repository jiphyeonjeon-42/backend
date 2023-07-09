import { envObject } from './envObject';

/** RDS 연결 옵션 파싱을 위한 스키마 */
export const rdsSchema = envObject('RDS_HOSTNAME', 'RDS_USERNAME', 'RDS_PASSWORD', 'RDS_DB_NAME')
  .transform((v) => ({
    host: v.RDS_HOSTNAME,
    username: v.RDS_USERNAME,
    password: v.RDS_PASSWORD,
    database: v.RDS_DB_NAME,
  }));

/** MYSQL 연결 옵션 파싱을 위한 스키마 */
const mysqlSchema = envObject('MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE')
  .transform((v) => ({
    username: v.MYSQL_USER,
    password: v.MYSQL_PASSWORD,
    database: v.MYSQL_DATABASE,
  }));

/** MYSQL 로컬 환경 연결 옵션 파싱을 위한 스키마 */
export const localSchema = mysqlSchema.transform((args) => ({ ...args, host: 'localhost' as const }));

/** MYSQL 배포 환경 연결 옵션 파싱을 위한 스키마 */
export const prodSchema = mysqlSchema.transform((args) => ({ ...args, host: 'database' as const }));
