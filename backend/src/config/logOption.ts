import { RuntimeMode } from './runtimeOption';

export type LogLevel = keyof typeof levels;
export const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

export const colors: Record<LogLevel, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
} as const;

export const getLogLevelOption = (mode: RuntimeMode) => {
  const logLevel = (mode === 'development' ? 'debug' : 'http');
  const consoleLogLevel = (mode === 'production' ? 'error' : 'debug');

  return { logLevel, consoleLogLevel } as const;
};
