import { Kysely, MysqlDialect } from "kysely"
import { createPool } from "mysql2"
import * as dotenv from "std/dotenv/mod.ts"
import type { DB } from "../../generated/schema.ts"
import { connectOptionSchema } from "./connectOption.ts"

const connectOption = connectOptionSchema
	.parse(await dotenv.load({ export: true }))

const dialect = new MysqlDialect({
	pool: createPool({ port: 3306, connectionLimit: 10, ...connectOption }),
})

export const db = new Kysely<DB>({
	dialect,
	log: (event) =>
		console.log("query:", event.query.sql, event.query.parameters),
})

export type Database = typeof db
