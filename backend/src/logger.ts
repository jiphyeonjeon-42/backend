import morgan from 'morgan';
import path from 'path';
import {
  addColors,
  createLogger,
  format,
  transports,
} from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import { logLevelOption } from '~/config';
import {
  colors,
  levels,
} from '~/config/logOption';

const {
  combine, timestamp, printf, colorize, errors,
} = format;

addColors(colors);

const logDir = '../logs';
const logTimestampFormat = 'YYYY-MM-DD HH:mm:ss:ms';
const datePattern = 'YYYY-MM-DD';

const logFormat = combine(
  errors({ stack: true }),
  timestamp({ format: logTimestampFormat }),
  printf((info) => {
    const message = `${info.timestamp} ${info.level}: ${info.message}`;

    return message + (info.stack ? `\n Error Stack: ${info.stack}` : '');
  }),
);

const consoleOpts = {
  handleExceptions: true,
  level: logLevelOption.consoleLogLevel,
  format: combine(
    colorize({ all: true }),
    timestamp({ format: logTimestampFormat }),
  ),
};

const logger = createLogger({
  level: logLevelOption.logLevel,
  levels,
  format: logFormat,
  transports: [
    new WinstonDaily({
      level: 'error',
      datePattern,
      dirname: path.join(__dirname, logDir, '/error'),
      filename: '%DATE%.error.log',
      maxFiles: 30,
      zippedArchive: true,
    }),
    new WinstonDaily({
      level: 'debug',
      datePattern,
      dirname: path.join(__dirname, logDir, '/all'),
      filename: '%DATE%.all.log',
      maxFiles: 7,
      zippedArchive: true,
    }),
    new transports.Console(consoleOpts),
  ],
});

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      // Use the http severity
      write: (message: string) => logger.http(message),
    },
  },
);

export { logger, morganMiddleware };
