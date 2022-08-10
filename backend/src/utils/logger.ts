import {
  createLogger, transports, format, addColors,
} from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import path from 'path';
import morgan from 'morgan';

const {
  combine, timestamp, printf, colorize, errors,
} = format;

const logDir = '../../logs';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};
addColors(colors);

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'http';
};

const logFormat = combine(
  errors({ stack: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  printf((info) => {
    if (info.stack) {
      return `${info.timestamp} ${info.level}: ${info.message} \n Error Stack: ${info.stack}`;
    }
    return `${info.timestamp} ${info.level}: ${info.message}`;
  }),
);

const consoleOpts = {
  handleExceptions: true,
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  ),
};

const logger = createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports: [
    new WinstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: path.join(__dirname, logDir, '/error'),
      filename: '%DATE%.error.log',
      maxFiles: 30,
      zippedArchive: true,
    }),
    new WinstonDaily({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
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
