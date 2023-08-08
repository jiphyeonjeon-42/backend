import { assert } from "std/assert/assert.ts"
import * as dotenv from "std/dotenv/mod.ts"

export const JWT_KEY = "access_token"

const getJwt = async (): Promise<string> => {
	await dotenv.load({
		envPath: "../.env",
		defaultsPath: null,
		examplePath: null,
		export: true,
	})
	const JWT_SECRET = Deno.env.get("JWT_SECRET")
	assert(JWT_SECRET, "Missing JWT_SECRET environment variable")
	return JWT_SECRET
}

export const JWT_SECRET = await getJwt()
