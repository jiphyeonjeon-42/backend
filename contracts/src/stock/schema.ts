import { metaSchema, positiveInt } from '../shared';
import { z } from '../zodWithOpenapi';

export const bookIdSchema = positiveInt.describe('업데이트 할 도서 ID');

export const stockPatchBodySchema = z.object({
	id: bookIdSchema.openapi({ example: 0 }),
});

export const stockPatchResponseSchema = z.literal('재고 상태가 업데이트되었습니다.');

export const stockGetQuerySchema = z.object({
	page: positiveInt.default(0),
	limit: positiveInt.default(10),
});

export const stockGetResponseSchema = z.object({
	items: z.array(
		z.object({
			bookId: positiveInt,
			bookInfoId: positiveInt,
			title: z.string(),
			author: z.string(),
			donator: z.string(),
			publisher: z.string(),
			publishedAt: z.string(),
			isbn: z.string(),
			image: z.string(),
			status: positiveInt,
			categoryId: positiveInt,
			callSign: z.string(),
			category: z.string(),
			updatedAt: z.string(),
		}),
	),
	meta: metaSchema,
});