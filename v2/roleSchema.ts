import { match } from "ts-pattern"
import { z } from "zod"

export type Role = "user" | "cadet" | "librarian" | "staff"
const fromEnum = (role: number): Role =>
	match(role)
		.with(0, () => "user" as const)
		.with(1, () => "cadet" as const)
		.with(2, () => "librarian" as const)
		.with(3, () => "staff" as const)
		.run()
export const roleSchema = z.number().int().min(0).max(3).transform(fromEnum)
