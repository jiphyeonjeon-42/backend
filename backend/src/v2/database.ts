import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import { connectOption } from '~/config/index.ts';
import type { DB } from './types.ts';

const dialect = new MysqlDialect({
  pool: createPool({
    port: 3306,
    ...connectOption,
    user: connectOption.username,
    connectionLimit: 10,
  })
})

export const db = new Kysely<DB>({ dialect })
