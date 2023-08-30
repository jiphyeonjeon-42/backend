import { metaSchema, positiveInt, mkErrorMessageSchema, statusSchema, metaPaginatedSchema } from "../shared";
import { z } from "../zodWithOpenapi";

export const commonQuerySchema = z.object({
	query: z.string().optional(),
	page: positiveInt.default(0).openapi({ example: 0 }),
	limit: positiveInt.default(10).openapi({ example: 10 }),
});

export const searchAllBookInfosQuerySchema = commonQuerySchema.extend({
	sort: z.enum(["new", "popular", "title"]).default('new'),
	category: z.string().optional(),
});

export const searchBookInfosByTagQuerySchema = commonQuerySchema.extend({
	query: z.string(),
	sort: z.enum(["new", "popular", "title"]).optional(),
	category: z.string().optional(),
});

export const searchBookInfosSortedQuerySchema = z.object({
	sort: z.enum(["new", "popular"]),
	limit: positiveInt.default(10).openapi({ example: 10 }),
});

export const searchBookInfoByIdPathSchema = z.object({
	id: positiveInt,
});

export const searchAllBooksQuerySchema = commonQuerySchema;

export const searchBookInfoCreateQuerySchema = z.object({
	isbnQuery: z.string().openapi({ example: '9791191114225' }),
});

export const createBookBodySchema = z.object({
	title: z.string(),
	isbn: z.string(),
	author: z.string(),
	publisher: z.string(),
	image: z.string(),
	categoryId: z.string(),
	pubdate: z.string(),
	donator: z.string(),
});

export const searchBookByIdParamSchema = z.object({
	id: positiveInt,
});

export const updateBookBodySchema = z.object({
	bookInfoId: positiveInt.optional(),
	title: z.string().optional(),
	author: z.string().optional(),
	publisher: z.string().optional(),
	publishedAt: z.string().optional(),
	image: z.string().optional(),
	categoryId: positiveInt.optional(),
	bookId: positiveInt.optional(),
	callSign: z.string().optional(),
	status: statusSchema.optional(),
});

export const updateDonatorBodySchema = z.object({
	bookId: positiveInt,
	nicknameOrEmail: z.string(),
});

export const bookInfoSchema = z.object({
	id: positiveInt,
	title: z.string(),
	author: z.string(),
	publisher: z.string(),
	isbn: z.string(),
	image: z.string(),
	category: z.string(),
	publishedAt: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	lendingCnt: positiveInt,
});

export const searchBookInfosResponseSchema = metaPaginatedSchema(bookInfoSchema)
  .extend({
	  categories: z.array(
		  z.object({
		  	name: z.string(),
		  	count: positiveInt,
		  }),
	  ),
});

export const searchBookInfosSortedResponseSchema = z.object({
	items: z.array(
		bookInfoSchema,
	)
});

export const searchBookInfoByIdResponseSchema = z.object({
	bookInfoSchema,
	books: z.array(
		z.object({
			id: positiveInt,
			callSign: z.string(),
			donator: z.string(),
			status: statusSchema,
			dueDate: z.string(),
			isLendable: positiveInt,
			isReserved: positiveInt,
		}),
	),
});

export const searchAllBooksResponseSchema =
	metaPaginatedSchema(
		z.object({
			bookId: positiveInt.openapi({ example: 1 }),
			bookInfoId: positiveInt.openapi({ example: 1 }),
			title: z.string().openapi({ example: '모두의 데이터 과학 with 파이썬' }),
			author: z.string().openapi({ example: '드미트리 지노비에프' }),
			donator: z.string().openapi({ example: 'mingkang' }),
			publisher: z.string().openapi({ example: '길벗' }),
			publishedAt: z.string().openapi({ example: '20170714' }),
			isbn: z.string().openapi({ example: '9791160502152' }),
			image: z.string().openapi({ example: 'https://image.kyobobook.co.kr/images/book/xlarge/152/x9791160502152.jpg' }),
			status: statusSchema.openapi({ example: 3 }),
			categoryId: positiveInt.openapi({ example: 8 }),
			callSign: z.string().openapi({ example: 'K23.17.v1.c1' }),
			category: z.string().openapi({ example: '데이터 분석/AI/ML' }),
			isLendable: positiveInt.openapi({ example: 0 }),
    })
);

export const searchBookInfoCreateResponseSchema = z.object({
	bookInfo: z.object({
		title: z.string().openapi({ example: '작별인사' }),
		image: z.string().openapi({ example: 'http://image.kyobobook.co.kr/images/book/xlarge/225/x9791191114225.jpg' }),
		author: z.string().openapi({ example: '지은이: 김영하' }),
		category: z.string().openapi({ example: '8' }),
		isbn: z.string().openapi({ example: '9791191114225' }),
		publisher: z.string().openapi({ example: '복복서가' }),
		pubdate: z.string().openapi({ example: '20220502' }),
	}),
})

export const searchBookByIdResponseSchema = z.object({
	id: positiveInt.openapi({ example: 3 }),
	bookId: positiveInt.openapi({ example: 3 }),
	bookInfoId: positiveInt.openapi({ example: 2}),
	title: z.string().openapi({ example: 'TCP IP 윈도우 소켓 프로그래밍(IT Cookbook 한빛 교재 시리즈 124)' }),
	author: z.string().openapi({ example: '김선우' }),
	donator: z.string().openapi({ example: 'mingkang' }),
	publisher: z.string().openapi({ example: '한빛아카데미' }),
	publishedAt: z.string().openapi({ example: '20130730' }),
	isbn: z.string().openapi({ example: '9788998756444' }),
	image: z.string().openapi({ example: 'https://image.kyobobook.co.kr/images/book/xlarge/444/x9788998756444.jpg' }),
	status: statusSchema.openapi({ example: 0 }),
	categoryId: positiveInt.openapi({ example: 2}),
	callSign: z.string().openapi({ example: 'C5.13.v1.c2' }),
	category: z.string().openapi({ example: '네트워크' }),
	isLendable: positiveInt.openapi({ example: 1 }),
});

export const updateBookResponseSchema = z.literal('책 정보가 수정되었습니다.');

export const updateDonatorResponseSchema = z.literal('기부자 정보가 수정되었습니다.');

export const createBookResponseSchema = z.object({
	callSign: z.string().openapi({ example: 'K23.17.v1.c1' }),
});

export const isbnNotFoundSchema = mkErrorMessageSchema('ISBN_NOT_FOUND').describe('국립중앙도서관 API에서 ISBN 검색이 실패하였습니다.');

export const naverBookNotFoundSchema = mkErrorMessageSchema('NAVER_BOOK_NOT_FOUND').describe('네이버 책검색 API에서 ISBN 검색이 실패');

export const insertionFailureSchema = mkErrorMessageSchema('INSERT_FAILURE').describe('예상치 못한 에러로 책 정보 insert에 실패함.');

export const categoryNotFoundSchema = mkErrorMessageSchema('CATEGORY_NOT_FOUND').describe('보내준 카테고리 ID에 해당하는 callsign을 찾을 수 없음');

export const pubdateFormatErrorSchema = mkErrorMessageSchema('PUBDATE_FORMAT_ERROR').describe('입력한 pubdate가 알맞은 형식이 아님. 기대하는 형식 "20220807"');

export const unknownPatchErrorSchema = mkErrorMessageSchema('PATCH_ERROR').describe('예상치 못한 에러로 patch에 실패.');

export const nonDataErrorSchema = mkErrorMessageSchema('NO_DATA_ERROR').describe('DATA가 적어도 한 개는 필요.');
