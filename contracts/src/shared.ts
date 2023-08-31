import { z } from './zodWithOpenapi';

export const positiveInt = z.coerce.number().int().nonnegative();

export const dateLike = z.union([z.date(), z.string()]).transform(String)

export const bookInfoIdSchema = positiveInt.describe('개별 도서 ID');

export const statusSchema = z.enum(["ok", "lost", "damaged"]);


/**
 * 오류 메시지를 통일된 형식으로 보여주는 zod 스키마를 생성합니다.
 *
 * ```ts
 * export const bookInfoNotFoundSchema =
 *   mkErrorMessageSchema('BOOK_INFO_NOT_FOUND').describe('해당 도서 연관 정보가 존재하지 않습니다')
 *
 * bookInfoNotFoundSchema
 * //=> z.object({
 * //   code: z.literal('BOOK_INFO_NOT_FOUND'),
 * // })
 * ```
 */
export const mkErrorMessageSchema = <const T extends string>(code: T) =>
  z.object({ code: z.literal(code) as z.ZodLiteral<T> });

export const unauthorizedSchema = mkErrorMessageSchema('UNAUTHORIZED').describe(
  '권한이 없습니다.',
);

export const bookNotFoundSchema =
  mkErrorMessageSchema('BOOK_NOT_FOUND').describe('해당 도서가 존재하지 않습니다');

export const bookInfoNotFoundSchema = mkErrorMessageSchema('BOOK_INFO_NOT_FOUND').describe('해당 도서 연관 정보가 존재하지 않습니다');

export const serverErrorSchema = mkErrorMessageSchema('SERVER_ERROR').describe('서버에서 오류가 발생했습니다.');

export const badRequestSchema = mkErrorMessageSchema('BAD_REQUEST').describe('잘못된 요청입니다.');

export const forbiddenSchema = mkErrorMessageSchema('FORBIDDEN').describe('권한이 없습니다.');

export const metaSchema = z.object({
  totalItems: positiveInt.describe('전체 검색 결과 수 ').openapi({ example: 42 }),
  totalPages: positiveInt.describe('전체 결과 페이지 수').openapi({ example: 5 }),
  // itemCount: positiveInt.describe('현재 페이지의 검색 결과 수').openapi({ example: 3 }),
  // itemsPerPage: positiveInt.describe('한 페이지당 검색 결과 수').openapi({ example: 10 }),
  // currentPage: positiveInt.describe('현재 페이지').openapi({ example: 1 }),
});

export const metaPaginatedSchema = <T extends z.ZodType<any>>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    meta: metaSchema,
  });

export const positive = z.number().int().positive();

const page = positive.describe('검색할 페이지').openapi({ example: 1 });
const perPage = positive.lte(100).describe('한 페이지당 검색 결과 수').openapi({ example: 10 });
const sort = z.enum(['asc', 'desc']).default('asc').describe('정렬 방식');

export const paginatedSearchSchema = z.object({ page, perPage, sort });

export const offsetPaginatedSchema = <T extends z.ZodType<any>>(itemSchema: T) =>
  z.object({
    rows: z.array(itemSchema),
    hasNextPage: z.boolean().optional().describe('다음 페이지가 존재하는지 여부'),
    hasPrevPage: z.boolean().optional().describe('이전 페이지가 존재하는지 여부'),
  });export const visibility = z.enum([ 'all', 'public', 'hidden' ]).default('public').describe('공개 상태')

