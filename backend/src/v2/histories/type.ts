import { z } from 'zod';
import { positiveInt } from '~/v1/reviews/controller/reviews.type';

export type ParsedHistoriesSearchCondition = z.infer<typeof getHistoriesSearchCondition>;
export const getHistoriesSearchCondition = z.object({
  query: z.string(),
  who: z.enum(['my', 'all']),
  page: positiveInt.default(0),
  limit: positiveInt.default(10),
  type: z.enum(['', 'user', 'title', 'callsign', 'bookId']),
});

export type ParsedHistoriesUserInfo = z.infer<typeof getHistoriesUserInfo>;
export const getHistoriesUserInfo = z.object({
  userId: positiveInt,
  userRole: positiveInt.max(3),
});
