import { z } from 'zod';

export const searchSchema = z.object({
  id: z.coerce.number().optional(),
  nicknameOrEmail: z.string().optional(),
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).default(5),
});

export const createSchema = z.object({});
