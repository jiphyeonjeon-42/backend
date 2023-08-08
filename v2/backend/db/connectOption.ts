import { z } from "zod"

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
