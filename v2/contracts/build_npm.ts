// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.37.0/mod.ts"

const outDir = "./npm"

await emptyDir(outDir)

await build({
	entryPoints: ["src/mod.ts"],
	outDir,
	shims: {
		// see JS docs for overview and more options
	},
	importMap: "../import_map.json",
	// packageManager: "pnpm",
	scriptModule: false,
	package: {
		name: "@jiphyeonjeon-42/contracts",
		version: "0.1.0-alpha",
		// type: "commonjs",
		// main: "dist/index.js",
		// types: "dist/index.d.ts",
		author: "the jiphyeonjeon developers",
		// scripts: {
		// 	"build": "tsc",
		// 	"dev": "tsc -w",
		// 	"check": "tsc --noEmit",
		// },
		// dependencies: {
		// 	"@anatine/zod-openapi": "^2.0.1",
		// 	"openapi3-ts": "^4.1.2",
		// },
		// devDependencies: {
		// 	"@typescript-eslint/eslint-plugin": "^6.1.0",
		// 	"@typescript-eslint/parser": "^6.1.0",
		// 	"eslint": "^8.45.0",
		// 	"@apidevtools/swagger-cli": "^4.0.4",
		// 	"openapi-endpoint-trimmer": "^2.0.0",
		// },
	},
	postBuild: () => {
		// steps to run after building and before running the tests
		Deno.copyFileSync("LICENSE", "npm/LICENSE")
		Deno.copyFileSync("README.md", "npm/README.md")
	},
})
