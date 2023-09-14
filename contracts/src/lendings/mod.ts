import { initContract } from '@ts-rest/core';
import {
  historiesGetMyQuerySchema,
  historiesGetQuerySchema,
  historiesGetResponseSchema,
} from './schema';
import { unauthorizedSchema } from '../shared';

export * from './schema';

//  contract 를 생성할 때, router 함수를 사용하여 api 를 생성
const c = initContract();

export const lendingsContract = c.router({
  getMine: {
    method: 'GET',
    path: '/mypage/lendings',
    description: '내 대출 기록을 가져옵니다.',
    query: historiesGetMyQuerySchema,
    responses: {
      200: historiesGetResponseSchema,
      401: unauthorizedSchema,
    },
  },
  get: {
    method: 'GET',
    path: '/lendings',
    description: '사서가 전체 대출 기록을 가져옵니다.',
    query: historiesGetQuerySchema,
    responses: {
      200: historiesGetResponseSchema,
      401: unauthorizedSchema,
    },
  },
});
