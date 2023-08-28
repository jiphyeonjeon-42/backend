import { match } from "ts-pattern";
import { db } from "~/kysely/mod";
import {
	FunctionModule as fn,
	ExpressionBuilder as eb
} from "kysely";
import { searchBookListAndCount, vSearchBookRepo } from "./repository";
import { BookNotFoundError, Meta } from "../shared";

// const querySearchCategoryByName = (category: string) =>
// 	db
// 		.selectFrom('category')
// 		.where('name', '=', category)
// 		.select('name')
// 		.executeTakeFirst();

// const querySearchCategoryList = (query: string) =>
// 	db
// 		.selectFrom('book_info')
// 		.rightJoin('category', 'book_info.categoryId', 'category.id')
// 		.select(({fn}) => [
// 			'category.name as name',
// 			fn.count<number>('category.name').as('count'),
// 		])
// 		.where('book_info.title', 'like', `%${query}%`)
// 		.where('book_info.author', 'like', `%${query}%`)
// 		.where('book_info.isbn', 'like', `%${query}%`)
// 		.groupBy('category.name')
// 		.execute();

// const querySearchBookList = (ordering: string, query: string)  =>
// 	db
// 		.selectFrom('book_info')
// 		.select((eb) => [
// 			'book_info.id as id',
// 			'book_info.title as title',
// 			'book_info.author as author',
// 			'book_info.publisher as publisher',
// 			'book_info.isbn as isbn',
// 			'book_info.image as image',
// 			eb.selectFrom('category')
// 				.whereRef('id', '=', 'category.id')
// 				.select('name')
// 				.as('category'),
// 			'book_info.publishedAt as publishedAt',
// 			'bookinfo.createdAt as createdAt',
// 			'book_info.updatedAt as updatedAt',
// 			eb.selectFrom('lending')
// 				.where('lending.bookId', '=', 'book_info.id')
// 				.select(({fn}) => [
// 					fn.count(id)
// 				])
// 				.as('lendingCnt')
// 		])

// type searchAllBookInfosArgs = { 
// 	query?: string | undefined,
// 	page: number,
// 	limit: number,
// 	sort: 'title' | 'new' | 'popular',
// 	category?: string | undefined
// };
// export const searchAllBookInfos = async (args: searchAllBookInfosArgs) => {
// 	let ordering = '';
// 	switch (args.sort) {
// 		case 'title':
// 			ordering = 'book_info.title';
// 			break;
// 		case 'popular':
// 			ordering = 'lendingCnt DESC, book_info.title';
// 			break;
// 		default:
// 			ordering = 'book_info.createdAt DESC, book_info.title';
// 	}
// 	const categoryResult = await querySearchCategoryByName(args.category ? args.category : "");
// 	const categoryName = categoryResult?.name;
// 	const categoryList = await querySearchCategoryList(args.query ? args.query : "");

	
// }

type SearchAllBooksArgs = { query?: string | undefined, page: number, limit: number };
export const searchAllBooks = async ({
	query,
	page,
	limit
}: SearchAllBooksArgs) => {
	const [BookList, totalItems] = await searchBookListAndCount({query: query ? query : '', page, limit});

	const meta: Meta = {
		totalItems,
		itemCount: BookList.length,
		itemsPerPage: limit,
		totalPages: Math.ceil(totalItems / limit),
		currentPage: page + 1,
	}
	return {items: BookList, meta};
}

type SearchBookByIdArgs = { id: number };
export const searchBookById = async ({ 
	id, 
}: SearchBookByIdArgs) => {
	const book = await vSearchBookRepo.findOneBy({bookId: id});
	
	return match(book)
		.with(null, () => new BookNotFoundError(id))
		.otherwise(() => {
			return {
				id: book?.bookId,
				...book
			};
		});
}