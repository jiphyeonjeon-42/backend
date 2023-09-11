import { dateLike, metaSchema, nonNegativeInt } from '../shared';
import { z } from '../zodWithOpenapi';

export const bookIdSchema = nonNegativeInt.describe('업데이트 할 도서 ID');

export const stockPatchBodySchema = z.object({
  id: bookIdSchema.openapi({ example: 0 }),
});

export const stockPatchResponseSchema = z.literal('재고 상태가 업데이트되었습니다.');

export const stockGetQuerySchema = z.object({
  page: nonNegativeInt.default(0),
  limit: nonNegativeInt.default(10),
});

export const stockGetResponseSchema = z.object({
  items: z.array(
    z.object({
      bookId: nonNegativeInt,
      bookInfoId: nonNegativeInt,
      title: z.string(),
      author: z.string(),
      donator: z.string(),
      publisher: z.string(),
      publishedAt: dateLike,
      isbn: z.string(),
      image: z.string(),
      status: nonNegativeInt,
      categoryId: nonNegativeInt,
      callSign: z.string(),
      category: z.string(),
      updatedAt: dateLike,
    }),
  ),
  meta: metaSchema,
});
