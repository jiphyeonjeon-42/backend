import { z } from 'zod';

/** DB 모드를 정의하는 스키마 */
export const modeSchema = z.enum(['local', 'RDS', 'prod']);

/** DB 선택 모드 */
export type Mode = z.infer<typeof modeSchema>;

/**
 * 환경변수에서 DB 모드를 파싱하는 함수
 */
export const modeEnvSchema = z.object({ MODE: modeSchema })
  .transform(({ MODE }) => MODE);

export const getModeOption = (processEnv: NodeJS.ProcessEnv) => modeEnvSchema.parse(processEnv);
