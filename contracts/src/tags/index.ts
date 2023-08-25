import { initContract } from '@ts-rest/core';
import {
  subDefaultTagQuerySchema,
  subDefaultTagResponseSchema,
  superDefaultTagResponseSchema,
} from './schema';
import {
  badRequestSchema,
  forbiddenSchema,
  paginationQuerySchema,
  serverErrorSchema,
} from '../shared';

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
    getSuperDefaultForMain: {
      method: 'GET',
      path: '/main',
      summary: '메인 페이지에서 사용할 태그 목록을 가져온다.',
      description: '슈퍼 태그(노출되는 태그), 디폴트 태그(노출되지 않고 분류되지 않은 태그)를 랜덤한 순서로 가져온다. 이는 메인 페이지에서 사용된다.',
      query: paginationQuerySchema.omit({ page: true }),
      responses: {
        200: superDefaultTagResponseSchema,
        400: badRequestSchema,
        401: forbiddenSchema,
        500: serverErrorSchema,
      },
    },
  },
  { pathPrefix: '/tags' },
);
