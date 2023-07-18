import { z } from '~/zodWithOpenapi';

export const positiveInt = z.coerce.number().int().nonnegative();

export const userSchema = z.object({
  id: positiveInt,
});

export const bookInfoIdSchema = positiveInt.describe('개별 도서 ID');
export const reviewsIdSchema = positiveInt.describe('도서 리뷰 ID');

export const contentSchema = z.object({
  content: z.string().min(10).max(420).openapi({ example: '책 정말 재미있어요 10글자 넘었다' }),
});

export type Sort = 'ASC' | 'DESC';
export const sortSchema = z.string().toUpperCase()
  .refine((s): s is Sort => s === 'ASC' || s === 'DESC')
  .default('DESC' as const);

/** 0: 공개, 1: 비공개, -1: 전체 리뷰 */
type Disabled = 0 | 1 | -1;
const disabledSchema = z.coerce.number().int().refine(
  (n): n is Disabled => [-1, 0, 1].includes(n),
  (n) => ({ message: `0: 공개, 1: 비공개, -1: 전체 리뷰, 입력값: ${n}` }),
);

export const queryOptionSchema = z.object({
  page: positiveInt.default(0),
  limit: positiveInt.default(10),
  sort: sortSchema,
});

export const getReviewsSchema = z.object({
  isMyReview: z.boolean().default(false),
  titleOrNickname: z.string().optional(),
  disabled: disabledSchema,
}).merge(queryOptionSchema);

export const createReviewsSchema = z.object({
  bookInfoId: bookInfoIdSchema,
  content: contentSchema,
});

export const reviewsIdPathSchema = z.object({
  reviewsId: reviewsIdSchema.openapi({ example: 1 }),
});

export const updateReviewsSchema = z.object({
  reviewsId: reviewsIdSchema,
  content: contentSchema,
});

export const deleteReviewsSchema = z.object({
  reviewsId: reviewsIdSchema,
});

export const patchReviewsSchema = z.object({
  reviewsId: reviewsIdSchema,
});

export const contentsBodySchema = z.object({
  reviewsId: reviewsIdSchema,
});
