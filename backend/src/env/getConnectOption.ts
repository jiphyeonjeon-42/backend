import { z } from 'zod';
import { localSchema, prodSchema, rdsSchema } from './dbSchema';
import { Mode } from './modeSchema';

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
export const getConnectOption = (mode: Mode) => (processEnv: NodeJS.ProcessEnv): ConnectOption => {
  const connectOptionSchema = getConnectOptionSchema(mode);

  return connectOptionSchema.parse(processEnv);
};
