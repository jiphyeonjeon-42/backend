import { z } from 'zod';

export const searchSchema = z.object({
  id: z.coerce.number().optional(),
  nicknameOrEmail: z.string().optional(),
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).default(5),
});

export const createSchema = z.object({
  email: z.string().email(),
  // password 는 10자 이상 42자 이하의 문자열이어야 하고 최소한 한 개의 숫자와 특수기호를 포함해야 한다.
  password: z.string().min(10).max(42).refine((value) => {
    const numberRegex = /[0-9]/;
    const symbolRegex = /[`~!@#$%^&*()\-_=+]/;
    return numberRegex.test(value) && symbolRegex.test(value);
  }),
});
