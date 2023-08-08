/// <reference lib="deno.ns" />
import { Hono } from "hono/mod.ts"
import { generateOpenApi } from "npm:@ts-rest/open-api"
import type { InfoObject } from "npm:openapi3-ts@2.0.2"
import { contract } from "../contracts/src/mod.ts"

export const info = {
	title: "Reviews Patch API (WIP)",
	version: "0.0.2-alpha",
} satisfies InfoObject

export const specs = generateOpenApi(contract, { info }, {
	setOperationId: false,
})

export const swaggerUrl = "/swagger-v2/openapi.json"

const id = "swagger-ui"

type ServeOpenApi = {
	path: string | URL
	info: InfoObject
	version?: string
}

export const swaggerUiByUrl =
	({ info, path, version = "4.18.2" }: ServeOpenApi) => () =>
		new Response(
			/*html*/ `
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>${info.title}</title>
                <meta name="description" content="${info.description}" />
                <meta name="og:description" content="${info.description}" />
                <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@${version}/swagger-ui.css" />
            </head>
            <body>
                <div id="${id}"></div>
                <script src="https://unpkg.com/swagger-ui-dist@${version}/swagger-ui-bundle.js" crossorigin></script>
                <script>
                    window.onload = () => {
                        window.ui = SwaggerUIBundle({ url: "${path}", dom_id: "#${id}" })
                    }
                </script>
            </body>
        </html>
        `,
			{ headers: { "content-type": "text/html charset=utf8" } },
		)

if (import.meta.main) {
	const { logger } = await import("hono/middleware.ts")
	const app = new Hono()
		.use("*", logger())
		.get(swaggerUrl, (c) => c.json(specs))
		.get("/swagger-v2", swaggerUiByUrl({ info, path: swaggerUrl }))

	Deno.serve({ port: 8000 }, app.fetch)
}
