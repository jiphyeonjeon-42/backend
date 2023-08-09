import {
	InterfaceDeclaration,
	Project,
	SourceFile,
} from "https://deno.land/x/ts_morph@19.0.0/mod.ts"
import { DialectManager, Generator, Logger } from "npm:kysely-codegen"
import { load } from "std/dotenv/mod.ts"
import { connectOptionSchema } from "./backend/db/connectOption.ts"

const connectionStringSchema = connectOptionSchema.transform((v) =>
	`mysql://${v.user}:${v.password}@${v.host}/${v.database}`
)

const outFile = "generated/schema.ts"

const generate = async () => {
	const connectionString = connectionStringSchema.parse(await load())
	const dialect = new DialectManager().getDialect("mysql")
	const db = await dialect.introspector.connect({ connectionString, dialect })
	const output = await new Generator().generate({
		camelCase: false,
		logger: new Logger(),
		excludePattern: "(v_*|typeorm_metadata)",
		dialect,
		db,
	})
	await db.destroy()
	return output
}

const sqlBool = "SqlBool"

const toSqlBoolFor = (properties: string[]) => (i: InterfaceDeclaration) => {
	i.getProperties()
		.filter((p) => properties.includes(p.getName()))
		.forEach((p) => p.setType(sqlBool))
}

const interfaceToType =
	(sourceFile: SourceFile) => (i: InterfaceDeclaration) => {
		const isExported = i.isExported()
		const name = i.getName()
		const types = i.getProperties()
			.map((p) => `${p.getName()}: ${p.getTypeNodeOrThrow().getText()}`)
			.join("\n")

		i.remove()
		sourceFile.addTypeAlias({ isExported, name, type: `{${types}}` })
	}

if (import.meta.main) {
	const output = await generate()
	const project = new Project()
	const sourceFile = project.createSourceFile(
		outFile,
		output,
		{ overwrite: true },
	)

	sourceFile.getImportDeclaration("kysely")
		?.addNamedImport(sqlBool)

	const toSqlBool = toSqlBoolFor(["isDeleted", "disabled"])
	const toType = interfaceToType(sourceFile)
	sourceFile.getInterfaces().forEach((i) => {
		toSqlBool(i)
		toType(i)
	})

	await project.save()
	await new Deno.Command("deno", { args: ["fmt", outFile] }).output()
}
