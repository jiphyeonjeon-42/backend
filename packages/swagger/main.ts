/// <reference lib="deno.ns" />
import { Hono } from "hono/mod.ts"
import { html } from "hono/middleware/html/index.ts"
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

export const swaggerUrl = "/swagger-v2"
export const swaggerJsonUrl = `${swaggerUrl}/openapi.json`

const id = "swagger-ui"
type SwaggerOption = {
	path: string | URL
	info: InfoObject
	version?: string
}
export const swaggerUiByUrl = (
	{ info: { title, description }, path, version = "4.18.2" }: SwaggerOption,
) =>
	html`
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>${title}</title>
                <meta name="description" content="${description}" />
                <meta name="og:description" content="${description}" />
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
        `

if (import.meta.main) {
	const { logger } = await import("hono/middleware.ts")
	const app = new Hono()
		.use("*", logger())
		.get(swaggerJsonUrl, (c) => c.json(specs))
		.get(
			swaggerUrl,
			(c) => c.html(swaggerUiByUrl({ info, path: swaggerJsonUrl })),
		)

	Deno.serve({ port: 8000 }, app.fetch)
}
