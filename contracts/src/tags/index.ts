import { initContract } from '@ts-rest/core';
import {
  subDefaultTagQuerySchema,
  subDefaultTagResponseSchema,
} from './schema';
import { badRequestSchema, forbiddenSchema, serverErrorSchema } from '..';

const c = initContract();

export const tagContract = c.router(
  {
    getSubDefault: {
      method: 'GET',
      path: '',
      summary: '서브/디폴트 태그 정보를 검색한다.',
      description: '서브/디폴트 태그 정보를 검색한다. 이는 태그 관리 페이지에서 사용한다.',
      query: subDefaultTagQuerySchema,
      responses: {
        200: subDefaultTagResponseSchema,
        400: badRequestSchema,
        401: forbiddenSchema,
        500: serverErrorSchema,
      },
    },
  },
  { pathPrefix: '/tags' },
);
