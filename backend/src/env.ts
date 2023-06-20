import dotenv from 'dotenv';
import { z } from 'zod';

/** 양의 10진법 정수로 변환 가능한 문자열 */
export const numeric = z.string().regex(/^\d+$/).transform(Number);

/** 비어있지 않은 문자열 */
const nonempty = z.string().nonempty();

/**
 * 키 목록으로부터 zod 환경변수 스키마를 생성해주는 헬퍼
 *
 * @param keys 환경변수 키 목록
 */
const envObject = <T extends readonly string[]>(...keys: T) => {
  type Keys = T[ number ];
  const env = Object.fromEntries(keys.map((key) => [key, nonempty]));

  return z.object(env as Record<Keys, typeof nonempty>);
};

/** RDS 연결 옵션 파싱을 위한 스키마 */
const rdsSchema = envObject('RDS_HOSTNAME', 'RDS_USERNAME', 'RDS_PASSWORD', 'RDS_DB_NAME')
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
const localSchema = mysqlSchema.transform((args) => ({ ...args, host: 'localhost' as const }));

/** MYSQL 배포 환경 연결 옵션 파싱을 위한 스키마 */
const prodSchema = mysqlSchema.transform((args) => ({ ...args, host: 'database' as const }));

/** DB 모드를 정의하는 스키마 */
const modeSchema = z.enum(['local', 'RDS', 'prod']);
export type Mode = z.infer<typeof modeSchema>;

/** DB 모드에 따라 사용할 DB 연결 옵션 */
export type ConnectOption = z.infer<ReturnType<typeof getConnectOptionSchema>>;

/** DB 모드에 따라 사용할 DB 연결 옵션 스키마를 고르는 함수 */
const getConnectOptionSchema = (mode: Mode) => {
  if (mode === 'local') return localSchema;
  if (mode === 'RDS') return rdsSchema;
  return prodSchema;
};

/**
 * 환경변수에서 DB 연결 옵션을 파싱하는 함수
 */
const getConnectOption = (processEnv: NodeJS.ProcessEnv): ConnectOption => {
  const modeEnvSchema = z.object({ MODE: modeSchema }).transform(({ MODE }) => MODE);

  const mode = modeEnvSchema.parse(processEnv);
  return getConnectOptionSchema(mode).parse(processEnv);
};

// .env 파일을 읽어서 process.env에 추가
dotenv.config();
export const connectOption = getConnectOption(process.env);
