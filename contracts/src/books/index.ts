import { initContract } from "@ts-rest/core";
import { 
	searchAllBooksQuerySchema,
	searchAllBooksResponseSchema,
	searchBookByIdResponseSchema,
	searchBookInfoCreateQuerySchema,
	searchBookInfoCreateResponseSchema,
	createBookBodySchema,
	createBookResponseSchema,
	categoryNotFoundSchema,
	formatErrorSchema,
	insertionFailureSchema,
	isbnNotFoundSchema,
	naverBookNotFoundSchema,
	updatebookBodySchema,
	updateBookResponseSchema,
	unknownPatchErrorSchema,
	nonDataErrorSchema,
	searchAllBookInfosQuerySchema,
	searchBookInfosResponseSchema,
	searchBookInfosByTagQuerySchema,
	searchBookInfosSortedQuerySchema,
	searchBookInfosSortedResponseSchema,
	searchBookInfoByIdQuerySchema,
	searchBookInfoByIdResponseSchema
} from "./schema";
import { bookInfoNotFoundSchema, bookNotFoundSchema } from "../shared";

const c = initContract();

export const booksContract = c.router(
	{
		searchAllBookInfos: {
			method: 'GET',
			path: '/info/search',
			description: '책 정보(book_info)를 검색하여 가져온다.',
			query: searchAllBookInfosQuerySchema,
			responses: {
				200: searchBookInfosResponseSchema,
				// 400: ,
			},
		},
		searchBookInfosByTag: {
			method: 'GET',
			path: '/info/tag',
			description: '똑같은 내용의 태그가 달린 책의 정보를 검색하여 가져온다.',
			query: searchBookInfosByTagQuerySchema,
			responses: {
				200: searchBookInfosResponseSchema,
				// 400: ,
			},
		},
		searchBookInfosSorted: {
			method: 'GET',
			path: '/info/sorted',
			description: '책 정보를 기준에 따라 정렬한다. 정렬기준이 popular일 경우 당일으로부터 42일간 인기순으로 한다.',
			query: searchBookInfosSortedQuerySchema,
			responses: {
				200: searchBookInfosSortedResponseSchema,
				// 400: ,
			},
		},
		searchBookInfoById: {
			method: 'GET',
			path: '/info/:id',
			description: 'book_info테이블의 ID기준으로 책 한 종류의 정보를 가져온다.',
			query: searchBookInfoByIdQuerySchema,
			responses: {
				200: searchBookInfoByIdResponseSchema,
				404: bookInfoNotFoundSchema,
			}
		},
		searchAllBooks: {
			method: 'GET',
			path: '/search',
			description: '개별 책 정보(book)를 검색하여 가져온다. 책이 대출할 수 있는지 확인 할 수 있음',
			query: searchAllBooksQuerySchema,
			responses: {
				200: searchAllBooksResponseSchema,
				// 400: ,
			},
		},
		searchBookInfoForCreate: {
			method: 'GET',
			path: '/create',
			description: '책 생성을 위해 국립중앙도서관에서 ISBN으로 검색한 뒤에 책정보를 반환',
			query: searchBookInfoCreateQuerySchema,
			responses: {
				200: searchBookInfoCreateResponseSchema,
				303: isbnNotFoundSchema,
				310: naverBookNotFoundSchema,
			}
		},
		searchBookById: {
			method: 'GET',
			path: '/:bookId',
			description: 'book테이블의 ID기준으로 책 한 종류의 정보를 가져온다.',
			responses: {
				200: searchBookByIdResponseSchema,
				404: bookNotFoundSchema,
			}
		},
		createBook: {
			method: 'POST',
			path: '/create',
			description: '책 정보를 생성한다. bookInfo가 있으면 book에만 insert한다.',
			body: createBookBodySchema,
			responses: {
				200: createBookResponseSchema,
				308: insertionFailureSchema,
				309: categoryNotFoundSchema,
				311: formatErrorSchema,
			},
		},
		updateBook: {
			method: 'PATCH',
			path: '/update',
			description: '책 정보를 수정합니다. book_info table or book table',
			body: updatebookBodySchema,
			responses: {
				204: updateBookResponseSchema,
				312: unknownPatchErrorSchema,
				313: nonDataErrorSchema,
				311: formatErrorSchema,
			},
		},
	},
	{ pathPrefix: '/books' },
)