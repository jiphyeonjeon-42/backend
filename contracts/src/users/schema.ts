import { mkErrorMessageSchema, positiveInt } from '../shared';
import { z } from '../zodWithOpenapi';

export const searchUserSchema = z.object({
  nicknameOrEmail: z.string().nullable().describe('검색할 유저의 nickname or email'),
  page: positiveInt.nullable().default(0).describe('페이지'),
  limit: positiveInt.nullable().default(10).describe('한 페이지에 들어올 검색결과 수'),
  id: positiveInt.nullable().describe('검색할 유저의 id'),
});

export const searchUserResponseSchema = z.object({

});
