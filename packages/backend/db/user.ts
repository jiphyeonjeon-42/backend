import { db } from "./mod.ts"
import { roleSchema } from "./shared.ts"

export type ParsedUser = NonNullable<Awaited<ReturnType<typeof getUserById>>>
export const getUserById = async (id: number) => {
	const user = await db
		.selectFrom("user").where("id", "=", id).selectAll()
		.executeTakeFirst()

	return user && { ...user, role: roleSchema.parse(user.role) }
}
