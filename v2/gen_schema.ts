import { Project } from "https://deno.land/x/ts_morph@19.0.0/mod.ts"
import { DialectManager, Generator, Logger } from "npm:kysely-codegen"
import { load } from "std/dotenv/mod.ts"
import { connectOptionSchema } from "~/db.ts"

const connectionStringSchema = connectOptionSchema.transform((v) =>
	`mysql://${v.user}:${v.password}@${v.host}/${v.database}`
)

const outFile = "generated/schema.ts"

const generate = async () => {
	const connectionString = connectionStringSchema.parse(await load())
	const dialect = new DialectManager().getDialect("mysql")
	const db = await dialect.introspector.connect({ connectionString, dialect })
	const output = await new Generator().generate({
		camelCase: true,
		logger: new Logger(),
		excludePattern: "(v_*|typeorm_metadata)",
		dialect,
		db,
	})
	await db.destroy()
	return output
}

if (import.meta.main) {
	const output = await generate()
	const project = new Project()
	const sourceFile = project.createSourceFile(outFile, output, {
		overwrite: true,
	})

	// convert all interface to type
	sourceFile.getInterfaces().forEach((i) => {
		const isExported = i.isExported()
		const name = i.getName()
		const types = i.getProperties()
			.map((p) => `${p.getName()}: ${p.getTypeNodeOrThrow().getText()}`)
			.join("\n")

		i.remove()
		sourceFile.addTypeAlias({
			isExported,
			name,
			type: `{${types}}`,
		})
	})
	await project.save()
	await new Deno.Command("deno", { args: ["fmt", outFile] }).output()
}
