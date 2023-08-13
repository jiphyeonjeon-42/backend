import { z } from 'zod';
import { positiveInt } from '~/v1/reviews/controller/reviews.type';

export type ParsedHistoriesSearchCondition = z.infer<typeof getHistoriesSearchCondition>;
export const getHistoriesSearchCondition = z.object({
  query: z.string().optional(),
  type: z.enum(['user', 'title', 'callsign']).optional(),
  page: z.number().nonnegative().default(0),
  limit: z.number().nonnegative().default(10),
});

export type ParsedHistoriesUserInfo = z.infer<typeof getHistoriesUserInfo>;
export const getHistoriesUserInfo = z.object({
  userId: positiveInt,
  userRole: positiveInt.max(3),
});
