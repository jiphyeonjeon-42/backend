import { z } from 'zod';

/** DB 모드를 정의하는 스키마 */
export const modeSchema = z.enum(['local', 'RDS', 'prod', 'https']);

/** DB 선택 모드 */
export type Mode = z.infer<typeof modeSchema>;

export const modeEnvSchema = z.object({ MODE: modeSchema });

/**
 * 환경변수에서 DB 모드를 파싱하는 함수
 */
export const getModeOption = (processEnv: NodeJS.ProcessEnv): Mode => {
  const { MODE: mode } = modeEnvSchema.parse(processEnv);

  return mode;
};
