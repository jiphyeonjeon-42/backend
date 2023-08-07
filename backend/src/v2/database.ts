import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import { connectOption } from '~/config/index.ts';
import type { DB } from './types.ts';

const { username: user, ...rest } = connectOption

const dialect = new MysqlDialect({
  pool: createPool({
    port: 3306,
    ...rest,
    user,
    connectionLimit: 10,
  })
})

export const db = new Kysely<DB>({
  dialect,
  log: (event) => {
    console.log(event.query.sql, event.query.parameters)
  }
})

export type KyDB = typeof db
