import { Kysely, MysqlDialect } from "kysely"
import { createPool } from "mysql2"
import * as dotenv from "std/dotenv/mod.ts"
import { z } from "zod"
import type { DB } from "../generated/schema.ts"

export const connectOptionSchema = z.object({
	RDS_DB_NAME: z.string().min(1),
	RDS_USERNAME: z.string().min(1),
	RDS_PASSWORD: z.string().min(1),
	RDS_HOSTNAME: z.string().min(1),
}).transform((v) => ({
	host: v.RDS_HOSTNAME,
	user: v.RDS_USERNAME,
	password: v.RDS_PASSWORD,
	database: v.RDS_DB_NAME,
}))

const connectOption = connectOptionSchema.parse(
	await dotenv.load({ export: true }),
)

const dialect = new MysqlDialect({
	pool: createPool({
		port: 3306,
		connectionLimit: 10,
		...connectOption,
	}),
})

export const db = new Kysely<DB>({
	dialect,
	log: (event) => console.log('query:', event.query.sql, event.query.parameters),
})

export type Database = typeof db
