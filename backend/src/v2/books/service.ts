import { match } from "ts-pattern";
import { bookExists, createBookInfo, getNewCallsignPrimaryNum, searchBookListAndCount, vSearchBookRepo, updateBookById, updateBookInfoById } from "./repository";
import { BookNotFoundError, Meta } from "../shared";
import { PubdateFormatError } from "./errors";

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

// const getCategoryAlphabet = (categoryId: number): string => {
// 	const category = Object.values(categoryId) as string[];
// 	return category[categoryId - 1];
// }

// export type CreateBookArgs = {
// 	infoId?: number | undefined,
// 	title: string,
// 	isbn: string,
// 	author: string,
// 	publisher: string,
// 	image?: string | undefined,
// 	categoryId: string,
// 	pubdate: string,
// 	donator?: string | undefined
// }
// export const createBook = async (book: CreateBookArgs) => {
// 	const bookExistence = await bookExists(book.isbn);
// 	const categoryAlphabet = getCategoryAlphabet(Number(book.categoryId));
// 	let recommendPrimaryNum;

// 	if (bookExistence === 0)
// 	{
// 		const bookInfo = await createBookInfo(book);
// 		book.infoId = bookInfo.id;
// 		recommendPrimaryNum = getNewCallsignPrimaryNum(book.categoryId);
// 	}
// 	else
// 	{
// 		const [bookInfo, count] = await  searchBookListAndCount({ query: book.isbn, page: 0, limit: 1 });
// 		book.infoId = bookInfo[0].bookInfoId;
// 		const nums = 
// 	}
// }

type UpdateBookArgs = {
	bookId: number,
	callSign?: string | undefined,
	status?: number | undefined
};
const updateBook = async (book: UpdateBookArgs) => {
	return await updateBookById({ id: book.bookId, callSign: book.callSign, status: book.status });
}

type UpdateBookInfoArgs = {
	bookInfoId: number,
	title?: string | undefined,
	author?: string | undefined,
	publisher?: string | undefined,
	publishedAt?: string | undefined,
	image?: string | undefined,
	categoryId?: number | undefined,
}
const pubdateFormatValidator = (pubdate: string) => {
	const regexCondition = /^[0-9]{8}$/;
	return regexCondition.test(pubdate)
}
const updateBookInfo = async (book: UpdateBookInfoArgs) => {
	if (book.publishedAt && !pubdateFormatValidator(book.publishedAt))
		return new PubdateFormatError(book.publishedAt);
	return await updateBookInfoById({
		id: book.bookInfoId,
		title: book.title,
		author: book.author,
		publisher: book.publisher,
		publishedAt: book.publishedAt,
		image: book.image,
		categoryId: book.categoryId
	});
}

type UpdateBookOrBookInfoArgs = 
	Omit<UpdateBookArgs, 'bookId'>
	& Omit<UpdateBookInfoArgs, 'bookInfoId'> 
	& {
	bookId?: number | undefined,
	bookInfoId?: number | undefined,
};
export const updateBookOrBookInfo = async ( book: UpdateBookOrBookInfoArgs ) => {
	if (book.bookId)
		await updateBook({
			bookId: book.bookId,
			callSign: book.callSign,
			status: book.status
		});
	if (book.bookInfoId)
		return await updateBookInfo({
			bookInfoId: book.bookInfoId,
			title: book.title,
			author: book.author,
			publisher: book.publisher,
			publishedAt: book.publishedAt,
			image: book.image,
			categoryId: book.categoryId
		});
}