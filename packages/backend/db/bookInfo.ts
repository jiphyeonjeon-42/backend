import { db } from "./mod.ts"

export const bookInfoExistsById = (id: number) =>
	db
		.selectFrom("book_info")
		.where("id", "=", id)
		.executeTakeFirst()
