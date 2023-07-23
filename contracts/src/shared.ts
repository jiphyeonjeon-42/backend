import { z } from './zodWithOpenapi';

export const positiveInt = z.coerce.number().int().nonnegative();

export const bookInfoIdSchema = positiveInt.describe('개별 도서 ID');

export const bookInfoNotFoundSchema = z.object({
  code: z.literal('BOOK_INFO_NOT_FOUND'),
  description: z.literal('bookInfoId가 유효하지 않음'),
});
