import { db } from "~/kysely/mod.ts";
import { executeWithOffsetPagination } from "kysely-paginate";
import { sql } from "kysely";

import jipDataSource from "~/app-data-source";
import { VSearchBook, Book, BookInfo } from "~/entity/entities";
import { Like } from "typeorm";
import { CreateBookArgs } from "./service";

export const vSearchBookRepo = jipDataSource.getRepository(VSearchBook)
export const bookRepo = jipDataSource.getRepository(Book);
export const bookInfoRepo = jipDataSource.getRepository(BookInfo);


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

// export const bookExists = async (isbn: string) => {
// 	return bookInfoRepo.count({ where: { isbn } });
// }

// export const createBookInfo = async (target : CreateBookArgs) => {
// 	const bookInfo: BookInfo = {
// 		title: target.title,
// 		author: target.author,
// 		publisher: target.publisher,
// 		publishedAt: target.pubdate,
// 		categoryId: Number(target.categoryId),
// 		isbn: target.isbn,
// 		image: target.image
// 	};
// 	return bookInfoRepo.save(bookInfo);
// }

// export const getNewCallsignPrimaryNum = async (categoryId: string) => {
// 	return (await bookInfoRepo.countBy({ categoryId: Number(categoryId) })) + 1;
// }

// export const getOldCallsignNums = async (categoryAlphabet: string) =>
// 	db
// 		.selectFrom(books)
// 		.

type UpdateBookArgs = {
	id: number,
	callSign?: string | undefined,
	status?: number | undefined,
};
export const updateBookById = async ({
	id,
	callSign,
	status,
}: UpdateBookArgs ) => {
	await bookRepo.update(id, {callSign, status});
}

type UpdateBookInfoArgs = {
	id: number,
	title?: string | undefined,
	author?: string | undefined,
	publisher?: string | undefined,
	publishedAt?: string | undefined,
	image?: string | undefined,
	categoryId?: number | undefined
};
export const updateBookInfoById = async ({
	id,
	title,
	author,
	publisher,
	publishedAt,
	image,
	categoryId
}: UpdateBookInfoArgs ) => {
	await bookInfoRepo.update(id, {title, author, publisher, publishedAt, image, categoryId})
}