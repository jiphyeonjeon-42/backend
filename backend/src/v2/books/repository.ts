import { db } from "~/kysely/mod.ts";
import { executeWithOffsetPagination } from "kysely-paginate";
import { SqlBool } from "kysely";

import jipDataSource from "~/app-data-source";
import { VSearchBook, Book } from "~/entity/entities";
import { Like } from "typeorm";

export const vSearchBookRepo = jipDataSource.getRepository(VSearchBook)
export const bookRepo = jipDataSource.getRepository(Book);


type SearchBookListArgs = { query: string; page: number; limit: number };
export const searchBookListAndCount = ({
	query,
	page,
	limit
}: SearchBookListArgs) => {
	return vSearchBookRepo.findAndCount({
		where: [
			{ title: Like(`%${query}%`) },
			{ author: Like(`%${query}%`) },
			{ isbn: Like(`%${query}%`) },
		],
		take: limit,
		skip: page * limit,
	});
}