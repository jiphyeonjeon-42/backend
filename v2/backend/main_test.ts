import { assertEquals } from "std/assert/mod.ts"
import { app } from "~/main.ts"

Deno.test("hello world", async () => {
	const res = await app.request("http://localhost/")
	assertEquals(res.status, 200)
	assertEquals(await res.text(), "Hello world!")
})
