import { dateLike, metaSchema, positiveInt } from '../shared';
import { z } from '../zodWithOpenapi';

export const historiesGetQuerySchema = z.object({
  query: z.string().optional(),
  type: z.enum(['user', 'title', 'callsign']).optional(),
  page: z.number().int().nonnegative().default(0),
  limit: z.number().int().nonnegative().default(10),
});

export const historiesGetResponseSchema = z.object({
  items: z.array(
    z.object({
      id: positiveInt,
      lendingCondition: z.string(),
      login: z.string(),
      returningCondition: z.string(),
      penaltyDays: z.number().int().nonnegative(),
      callSign: z.string(),
      title: z.string(),
      bookInfoId: positiveInt,
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
