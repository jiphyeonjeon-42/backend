import z from 'zod';
import { bookInfoIdSchema, nonNegativeInt } from '../shared';

export const likeNotFoundSchema = z.object({
  code: z.literal('LIKE_NOT_FOUND'),
  description: z.literal('like 가 존재하지 않음'),
});

export const likeResponseSchema = z
  .object({
    bookInfoId: bookInfoIdSchema,
    isLiked: z.boolean(),
    likeNum: nonNegativeInt,
  })
  .openapi({
    examples: [
      {
        summary: '성공 예시',
        value: { bookInfoId: 1, isLiked: true, likeNum: 1 },
      },
    ],
  });
