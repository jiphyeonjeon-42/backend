import { z } from './zodWithOpenapi';

export const positiveInt = z.coerce.number().int().nonnegative();

export const bookInfoIdSchema = positiveInt.describe('개별 도서 ID');

type ErrorMessage = { code: string; description: string };

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

export const bookInfoNotFoundSchema =
  mkErrorMessageSchema('BOOK_INFO_NOT_FOUND').describe('해당 도서 연관 정보가 존재하지 않습니다');

export const bookNotFoundSchema =
  mkErrorMessageSchema('BOOK_NOT_FOUND').describe('해당 도서가 존재하지 않습니다');

export const metaSchema = z.object({
  totalItems: positiveInt,
  itemCount: positiveInt,
  itemsPerPage: positiveInt,
  totalPages: positiveInt,
  currentPage: positiveInt,
});