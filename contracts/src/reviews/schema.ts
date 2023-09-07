import { mkErrorMessageSchema, positiveInt } from '../shared';
import { z } from '../zodWithOpenapi';

export const reviewsIdSchema = positiveInt.describe('도서 리뷰 ID');

export const contentSchema = z.object({
  content: z.string().min(10).max(420).openapi({ example: '책 정말 재미있어요 10글자 넘었다' }),
});

export const reviewIdPathSchema = z.object({
  reviewsId: reviewsIdSchema.openapi({ example: 1 }),
});

export const reviewNotFoundSchema =
  mkErrorMessageSchema('REVIEW_NOT_FOUND').describe('검색한 리뷰가 존재하지 않습니다.');
export const mutationDescription = (action: '수정' | '삭제') =>
  `리뷰를 ${action}합니다. 작성자 또는 관리자만 ${action} 가능합니다.`;

export const sqlBool = z
  .number()
  .int()
  .gte(0)
  .lte(1)
  .transform((x) => Boolean(x))
  .or(z.boolean());

export const reviewSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  nickname: z.string().nullable(),
  bookInfoId: z.number().int(),
  createdAt: z.date().transform((x) => x.toISOString()),
  title: z.string().nullable(),
  content: z.string(),
  disabled: sqlBool,
});
