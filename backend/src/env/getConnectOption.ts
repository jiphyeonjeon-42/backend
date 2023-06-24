import { z } from 'zod';
import { localSchema, prodSchema, rdsSchema } from './dbSchema';

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
export const getConnectOption = (processEnv: NodeJS.ProcessEnv): ConnectOption => {
  const modeEnvSchema = z.object({ MODE: modeSchema }).transform(({ MODE }) => MODE);

  const mode = modeEnvSchema.parse(processEnv);
  return getConnectOptionSchema(mode).parse(processEnv);
};
