import { assertEquals } from "std/assert/mod.ts"
import { app } from "./main.ts"

Deno.test("hello world", async () => {
	const res = await app.request("http://localhost/")
	assertEquals(res.status, 200)
	assertEquals(await res.text(), "Hello world!")
})

Deno.test("delete review", async () => {
	const res = await app.request("http://localhost/reviews/123", {
		method: "DELETE",
	})
    assertEquals(res.status, 200)
})
