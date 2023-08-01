import { mkErrorMessageSchema, positiveInt } from '../shared';
import { z } from '../zodWithOpenapi';

export const historiesGetQuerySchema = z.object({
  query: z.string().optional(),
  type: z.enum(['user', 'title', 'callsign']).optional(),
  page: z.number().int().nonnegative().default(0),
  limit: z.number().int().nonnegative().default(10),
});
