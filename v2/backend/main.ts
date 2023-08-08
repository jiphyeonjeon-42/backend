import { cors, jwt, logger } from "hono/middleware.ts"
import { Hono, HTTPException, MiddlewareHandler } from "hono/mod.ts"
import { generateOpenApi } from "npm:@ts-rest/open-api"
import { createHonoEndpoints, initServer } from "ts-rest-hono"
import { contract } from "../contracts/src/mod.ts"
import { info, specs, swaggerUiByUrl, swaggerUrl } from "../swagger/main.ts"
import { JWT_KEY, JWT_SECRET } from "./JWT_SECRET.ts"
import { getUserById, type ParsedUser } from "./db/user.ts"
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

const validatedApp = (app: Hono) => {
}

type HonoEnv = { Variables: { user: ParsedUser } }
app.use(
	"/auth/*",
	jwt({ secret: JWT_SECRET, cookie: JWT_KEY }),
	parseUser,
)

app
	.get(swaggerUrl, (c) => c.json(specs))
	.get("/swagger-v2", swaggerUiByUrl({ info, path: swaggerUrl }))

const s = initServer()
const router = s.router(contract, {
	reviews: {
		get: async () => {
			console.log("get")
			return {
				status: 200,
				body: { items: ["도서목록", "1234"] },
			}
		},
	},
})

createHonoEndpoints(contract, router, app, {
	jsonQuery: true,
	logInitialization: true,
	responseValidation: true,
})

if (import.meta.main) {
	Deno.serve({ port: 3000 }, app.fetch)
}
