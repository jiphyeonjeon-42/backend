import { z } from "zod"

/** 반환값이 조건을 만족하지 않으면 오류 throw */
const throwIf = <T>(value: T, ok: (v: T) => boolean) => {
	if (ok(value)) {
		return value
	} else {
		throw new Error(`값이 예상과 달리 ${value}입니다`)
	}
}

export type Visibility = "public" | "private" | "all"
const roles = ["user", "cadet", "librarian", "staff"] as const
export type Role = typeof roles[number]

const fromEnum = (role: number): Role =>
	throwIf(roles[role], (v) => v === undefined)

export const toRole = (role: Role): number =>
	throwIf(roles.indexOf(role), (v) => v === -1)

export const roleSchema = z.number().int().min(0).max(3).transform(fromEnum)
