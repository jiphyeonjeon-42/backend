import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const localEnv = z
  .object({
    MYSQL_HOSTNAME: z.string().default('local'),
    MYSQL_USER: z.string(),
    MYSQL_PASSWORD: z.string(),
    MYSQL_DATABASE: z.string(),
  })
  .transform(
    ({ MYSQL_HOSTNAME, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE }) => ({
      host: MYSQL_HOSTNAME,
      username: MYSQL_USER,
      password: MYSQL_PASSWORD,
      dbName: MYSQL_DATABASE,
    }),
  );

const rdsEnv = z
  .object({
    RDS_HOSTNAME: z.string(),
    RDS_USERNAME: z.string(),
    RDS_PASSWORD: z.string(),
    RDS_DB_NAME: z.string(),
  })
  .transform(({ RDS_HOSTNAME, RDS_USERNAME, RDS_PASSWORD, RDS_DB_NAME }) => ({
    host: RDS_HOSTNAME,
    username: RDS_USERNAME,
    password: RDS_PASSWORD,
    dbName: RDS_DB_NAME,
  }));

const dbEnvSchema = (() => {
  switch (process.env.MODE) {
    case 'local':
      return localEnv;
    case 'RDS':
      return rdsEnv;
    case 'prod':
      return localEnv;
    default:
      throw new Error('MODE is not defined');
  }
})();

export const { host, username, password, dbName } = dbEnvSchema.parse(
  process.env,
);

const envSchema = z.object({
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),
  REDIRECT_URL: z.string().default('https://server.42library.kr'),
  CLIENT_URL: z.string().default('https://42library.kr'),
  JWT_SECRET: z.string(),
  MODE: z.union([z.literal('local'), z.literal('RDS'), z.literal('prod')]),
});

export const env = envSchema.parse(process.env);
