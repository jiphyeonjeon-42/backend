import { dateLike, metaSchema, nonNegativeInt } from '../shared';
import { z } from '../zodWithOpenapi';

export const historiesGetMyQuerySchema = z.object({
  query: z.string().optional(),
  page: nonNegativeInt.default(0),
  limit: nonNegativeInt.default(10),
});

export const historiesGetQuerySchema = z.object({
  query: z.string().optional(),
  type: z.enum(['user', 'title', 'callsign']).optional(),
  page: nonNegativeInt.default(0),
  limit: nonNegativeInt.default(10),
});

export const historiesGetResponseSchema = z.object({
  items: z.array(
    z.object({
      id: nonNegativeInt,
      lendingCondition: z.string(),
      login: z.string(),
      returningCondition: z.string(),
      penaltyDays: nonNegativeInt,
      callSign: z.string(),
      title: z.string(),
      bookInfoId: nonNegativeInt,
      image: z.string(),
      createdAt: dateLike,
      returnedAt: dateLike,
      updatedAt: dateLike,
      dueDate: dateLike,
      lendingLibrarianNickName: z.string(),
      returningLibrarianNickname: z.string(),
    }),
  ),
  meta: metaSchema,
});
