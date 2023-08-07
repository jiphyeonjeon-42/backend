// import { cors, jwt, logger } from "hono/middleware.ts"
// import { Hono, HTTPException } from "hono/mod.ts"
// import { createHonoEndpoints, initServer } from "ts-rest-hono"
import { db } from "./db.ts"
import { Hono, logger } from "./deps/hono.ts"
import { JWT_KEY, JWT_SECRET } from "./JWT_SECRET.ts"
import { roleSchema } from "./roleSchema.ts"

const getUserById = async (id: number) => {
	const user = await db
		.selectFrom("user").where("id", "=", id).selectAll()
		.executeTakeFirst()

	return user && { ...user, role: roleSchema.parse(user.role) }
}
type ParsedUser = NonNullable<Awaited<ReturnType<typeof getUserById>>>

type Env = { Variables: { user: ParsedUser } }
export const app = new Hono<Env>()

app.use("*", logger())
app.use(
	"*",
	cors({
		origin: [
			"http://localhost:4242",
			"http://42library.kr",
			"https://42library.kr",
			"http://42jip.com",
		],
		credentials: true,
	}),
)
type Jwt = { id: number; iat: number; exp: number; iss: string }

app.use(
	"/auth/*",
	jwt({ secret: JWT_SECRET, cookie: JWT_KEY }),
	async (c, next) => {
		const { id } = c.get("jwtPayload") as Jwt
		const user = await getUserById(id)

		if (!user) {
			throw new HTTPException(401, {
				message: "User not found",
				res: c.res,
			})
		}
		c.set("user", user)
		await next()
	},
)

app.get("/", (c) => c.text(`Hello world!`))
app.get("/time", (c) => c.json({ time: new Date() }))
app.get(
	"/auth",
	(c) => {
		const { nickname, role } = c.get("user")
		return c.text(
			`This is a page with JWT validation!
            your username: ${nickname}, role: ${role}`,
		)
	},
)

app.get(
	"/entry/:id",
	(c) => {
		const id = c.req.param("id")
		return c.text(`This is entry ${id} `)
	},
)
// import { contract } from "../contracts/dist/index.js"

// const s = initServer()
// const router = s.router(contract, {
//     reviews: {

//     }
// })

// createHonoEndpoints(contract, router, app, {
//     jsonQuery: true,
//     logInitialization: true,
//     responseValidation: true,
// })

if (import.meta.main) {
	Deno.serve({ port: 3000 }, app.fetch)
}
