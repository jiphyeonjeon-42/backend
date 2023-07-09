import { z } from 'zod';

export type RuntimeMode = z.infer<typeof runtimeModeSchema>;
export const runtimeModeSchema = z.enum(['development', 'production']);

export const runtimeSchema = z.object({ NODE_ENV: runtimeModeSchema.default('development') });

export const getRuntimeMode = (processEnv: NodeJS.ProcessEnv): RuntimeMode => {
  const { NODE_ENV: mode } = runtimeSchema.parse(processEnv);

  return mode;
};
