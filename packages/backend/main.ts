import { cors, jwt, logger } from "hono/middleware.ts"
import { Hono, HTTPException, MiddlewareHandler } from "hono/mod.ts"
import { createHonoEndpoints, initServer } from "ts-rest-hono"
import { executeWithOffsetPagination } from "kysely-paginate"
import { contract } from "../contracts/src/mod.ts"
import {
	info,
	specs,
	swaggerJsonUrl,
	swaggerUiByUrl,
	swaggerUrl,
} from "../swagger/main.ts"
import { JWT_KEY, JWT_SECRET } from "./JWT_SECRET.ts"
import { getUserById, type ParsedUser } from "./db/user.ts"
import { createReview } from "./db/review.ts"
import { match } from "ts-pattern"
import { db } from "./db/mod.ts"
import { bookInfoExistsById } from "./db/bookInfo.ts"
type Jwt = { id: number; iat: number; exp: number; iss: string }

const origin = [
	"http://localhost:4242",
	"http://42library.kr",
	"https://42library.kr",
	"http://42jip.com",
]

export const app = new Hono<HonoEnv>()
app.use("*", logger())
app.use("*", cors({ origin, credentials: true }))

const parseUser: MiddlewareHandler<{ Variables: { user: ParsedUser } }> =
	async (c, next) => {
		const { id } = c.get("jwtPayload") as Jwt
		const user = await getUserById(id)

		if (!user) {
			throw new HTTPException(401, { message: "User not found", res: c.res })
		}
		await next()
	}

type HonoEnv = { Variables: { user: ParsedUser } }
app.use(
	"/auth/*",
	jwt({ secret: JWT_SECRET, cookie: JWT_KEY }),
	parseUser,
)

app
	.get(swaggerJsonUrl, (c) => c.json(specs))
	.get(
		swaggerUrl,
		(c) => c.html(swaggerUiByUrl({ info, path: swaggerJsonUrl })),
	)

const s = initServer<HonoEnv>()
const reviews = s.router(contract.reviews, {
	get: async ({ query: { query, visibility, page, perPage, sort } }) => {
		const searchQuery = db.selectFrom("reviews")
			.leftJoin("user", "user.id", "reviews.userId")
			.leftJoin("book_info", "book_info.id", "reviews.bookInfoId")
			.select([
				"id",
				"userId",
				"bookInfoId",
				"content",
				"createdAt",
				"book_info.title",
				"user.nickname",
				"user.intraId",
			])
			.where("content", "like", `%${query}%`)
			.orderBy("updatedAt", sort)

		const withVisibility = match(visibility)
			.with("visible", () => searchQuery.where("disabled", "=", false))
			.with("hidden", () => searchQuery.where("disabled", "=", true))
			.with("all", () => searchQuery)
			.exhaustive()

		const body = await executeWithOffsetPagination(
			withVisibility,
			{ page, perPage },
		)

		return { status: 200, body: body }
	},
	post: async ({ query: { bookInfoId }, body: { content } }, c) => {
		const { id: userId } = c.get("user")
		const bookInfo = await bookInfoExistsById(bookInfoId)

		if (bookInfo === undefined) {
			return { status: 404, body: { code: "BOOK_INFO_NOT_FOUND" } }
		}

		const result = await createReview({ bookInfoId, userId, content })
		if (result === undefined) {
			throw new HTTPException(500, {
				message: "Internal Server Error",
				res: c.res,
			})
		}
		return { status: 201, body: "리뷰가 작성되었습니다." } as const
	},
})

const router = s.router(contract, {
	reviews,
})

createHonoEndpoints(contract, router, app, {
	jsonQuery: true,
	logInitialization: true,
	responseValidation: true,
})

if (import.meta.main) {
	Deno.serve({ port: 3000 }, app.fetch)
}
