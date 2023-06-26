import { z } from 'zod';

export const positiveInt = z.number().int().nonnegative();

export const userSchema = z.object({
  id: positiveInt,
});

export const bookInfoIdSchema = positiveInt;
export const reviewsIdSchema = positiveInt;

export const contentSchema = z.string().min(10).max(420);

export const sortSchema = z.enum(['ASC', 'DESC']);

export const createReviewsSchema = z.object({
  bookInfoId: bookInfoIdSchema,
  content: contentSchema,
});

export const getReviewsSchema = z.object({
  isMyReview: z.boolean(),
  titleOrNickname: z.string(),
  disabled: z.number(),
  page: positiveInt,
  limit: positiveInt,
  sort: sortSchema,
});

export const updateReviewsSchema = z.object({
  content: contentSchema,
});

export const reviewIdParamSchema = z.object({
  reviewsId: positiveInt,
});
