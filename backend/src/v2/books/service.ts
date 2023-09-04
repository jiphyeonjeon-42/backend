import { match } from "ts-pattern";
import { 
	// bookExists,
	// createBookInfo,
	// getNewCallsignPrimaryNum,
	searchBookListAndCount,
	vSearchBookRepo,
	updateBookById,
	updateBookInfoById,
	searchBookInfoSpecById,
	searchBooksByInfoId, 
	getIsLendable,
	getIsReserved,
	getDuedate,
	getBookInfosSorted,
	getBookInfosByTag} from "./repository";
import { BookInfoNotFoundError, Meta, BookNotFoundError } from "../shared";
import { PubdateFormatError } from "./errors";
import { dateNow, dateSubDays } from "~/kysely/sqlDates";

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

type CategoryList = {name: string, count: number};
type SearchBookInfosByTag = { query: string, sort: string, page: number, limit: number, category?: string | undefined };
export const searchBookInfosByTag = async ({
	query,
	sort,
	page,
	limit,
	category
}: SearchBookInfosByTag ) => {
	let sortQuery = {};
	switch(sort)
	{
		case 'title':
			sortQuery = { title: 'ASC' };
			break;
		case 'popular':
			sortQuery = { lendingCnt: 'DESC' };
			break;
		default:
			sortQuery = { createdAt: 'DESC' };
	}

	let whereQuery: Array<object> = [
		{ superTagContent: query },
		{ subTagContent: query }
	];

	if (category)
	{
		whereQuery.push({ category });
	}

	const [bookInfoList, totalItems] = await getBookInfosByTag(whereQuery, sortQuery, page, limit);
	let categoryList = new Array<CategoryList> ;
	bookInfoList.forEach((bookInfo) => {
		const index = categoryList.findIndex((item) => bookInfo.category === item.name);
		if (index === -1)
			categoryList.push({name: bookInfo.category, count: 1});
		else
			categoryList[index].count += 1;
	});
	const meta = {
		totalItems,
		itemCount: bookInfoList.length,
		itemsPerPage: limit,
		totalPages: Math.ceil(bookInfoList.length / limit),
		currentPage: page + 1
	}

	return {
		items: bookInfoList,
		categories: categoryList,
		meta
	};
}

type SearchBookInfosSortedArgs = { sort: string, limit: number };
export const searchBookInfosSorted = async ({
	sort,
	limit,
}: SearchBookInfosSortedArgs ) => {
	let items;
	if (sort === 'popular')
	{
		items = await getBookInfosSorted(limit)
							.where('lending.createdAt', '>=', dateSubDays(dateNow(), 42))
							.orderBy('lendingCnt', 'desc')
							.orderBy('title', 'asc')
							.execute();
	}
	else {
		items = await getBookInfosSorted(limit)
							.orderBy('createdAt', 'desc')
							.orderBy('title', 'asc')
							.execute();
	}

	return { items } as const
}

export const searchBookInfoById = async (id: number) => {
	let bookSpec = await searchBookInfoSpecById(id);

	if (bookSpec === undefined)
		return new BookInfoNotFoundError(id);

	if (bookSpec.publishedAt)
	{
		const date = new Date(bookSpec.publishedAt);
		bookSpec.publishedAt = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
	}

	const eachbooks = await searchBooksByInfoId(id);

	const books = await Promise.all(
		eachbooks.map(async (eachBook) => {
			const isLendable = await getIsLendable(eachBook.id);
			const isReserved = await getIsReserved(eachBook.id);
			let dueDate;

			if (eachBook.status === 0 && isLendable === 0)
			{
				dueDate = await getDuedate(eachBook.id);
				dueDate = dueDate?.dueDate;
			}
			else
				dueDate = '-';

			return {
				...eachBook,
				dueDate,
				isLendable,
				isReserved
			}
		})
	);

	return {
		...bookSpec,
		books: books
	}
}

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

type UpdateBookDonatorArgs = {bookId: number, nickname: string };
export const updateBookDonator = async ({
	bookId,
	nickname
}: UpdateBookDonatorArgs ) => {

}