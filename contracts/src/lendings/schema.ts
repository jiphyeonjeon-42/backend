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
      lendingCondition: z.string().nullable(),
      login: z.string().nullable(),
      returningCondition: z.string().nullable(),
      penaltyDays: nonNegativeInt.nullable(),
      callSign: z.string(),
      title: z.string().nullable(),
      bookInfoId: nonNegativeInt.nullable(),
      image: z.string().nullable(),
      createdAt: dateLike.nullable(),
      returnedAt: dateLike.nullable(),
      updatedAt: dateLike,
      dueDate: dateLike.nullable(),
      lendingLibrarianNickName: z.string().nullable(),
      returningLibrarianNickname: z.string().nullable(),
    }),
  ),
  meta: metaSchema,
});
