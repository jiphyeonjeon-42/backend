import { db } from "~/kysely/mod.ts";
import { sql } from "kysely";

import jipDataSource from "~/app-data-source";
import { VSearchBook, Book, BookInfo } from "~/entity/entities";
import { Like } from "typeorm";
import { dateAddDays, dateFormat } from "~/kysely/sqlDates";

export const vSearchBookRepo = jipDataSource.getRepository(VSearchBook)
export const bookRepo = jipDataSource.getRepository(Book);
export const bookInfoRepo = jipDataSource.getRepository(BookInfo);


export const searchBookInfoSpecById = async ( id: number ) =>
	db
		.selectFrom('book_info')
		.select([
			'id',
			'title',
			'author',
			'publisher',
			'isbn',
			'image',
			'publishedAt',
			'createdAt',
			'updatedAt'
		])
		.select(({ selectFrom }) => [
			selectFrom('category')
			.select('name')
			.whereRef('category.id', '=', 'book_info.categoryId')
			.as('category'),
		])
		.where('id', '=', id)
		.executeTakeFirst();

export const searchBooksByInfoId = async ( id: number ) =>
	db
		.selectFrom('book')
		.select([
			'id',
			'callSign',
			'donator',
			'status'
		])
		.where('infoId', '=', id)
		.execute();

export const getIsLendable = async (id: number) =>
{
	const count1 = await db
					.selectFrom('lending')
					.where('bookId', '=', id)
					.where('returnedAt', 'is', null)
					.select(({ eb }) => eb.fn.countAll().as('count1'))
					.executeTakeFirst();

	const count2 = await db
					.selectFrom('book')
					.where('id', '=', id)
					.where('status', '=', 0)
					.select(({ eb }) => eb.fn.countAll().as('count2'))
					.executeTakeFirst();

	const count3 = await db
					.selectFrom('reservation')
					.where('bookId', '=', id)
					.where('status', '=', 0)
					.select(({ eb }) => eb.fn.countAll().as('count3'))
					.executeTakeFirst();

	if (count1?.count1 === 0 && count2?.count2 === 1 && count3?.count3 === 0)
		return 1;
	else
		return 0;

}

export const getIsReserved = async (id: number) =>
{
	const count = await db
				.selectFrom('reservation')
				.where('bookId', '=', id)
				.where('status', '=', 0)
				.select(({ eb }) => eb.fn.countAll().as('count'))
				.executeTakeFirst();

	if (Number(count?.count) > 0)
		return 1;
	else
		return 0;
}

export const getDuedate = async (id: number, interval = 14) =>
	db
		.selectFrom('lending')
		.where('bookId', '=', id)
		.orderBy('createdAt', 'desc')
		.limit(1)
		.select(({ ref }) => {
			const createdAt = ref('lending.createdAt');

			return dateAddDays(createdAt, interval).as('dueDate');
		})
		.executeTakeFirst();

type SearchBookListArgs = { query: string; page: number; limit: number };
export const searchBookListAndCount = async ({
	query,
	page,
	limit
}: SearchBookListArgs) => {
	return await vSearchBookRepo.findAndCount({
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