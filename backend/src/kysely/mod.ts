import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import type { DB } from './generated.ts';
import { connectOption } from '~/config/index.ts';

const { database, host, password, username: user } = connectOption;

const dialect = new MysqlDialect({
  pool: createPool({
    port: 3306,
    connectionLimit: 10,
    host,
    database,
    user,
    password,
  }),
});

export const db = new Kysely<DB>({
  dialect,
  log: event => console.log('kysely:', event.query.sql, event.query.parameters),
});

export type Database = typeof db;
