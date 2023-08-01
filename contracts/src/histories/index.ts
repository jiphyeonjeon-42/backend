import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  historiesGetQuerySchema,
} from './schema';
import { unauthorizedSchema } from '../shared';

export * from './schema';

//  contract 를 생성할 때, router 함수를 사용하여 api 를 생성
const c = initContract();

export const historiesContract = c.router(
  {
    getMyHistories: {
      method: 'GET',
      path: '/mypage/histories',
      description: '마이페이지에서 본인의 대출 기록을 가져온다.',
      query: historiesGetQuerySchema,
      responses: {
        200: z.literal('대출 기록이 성공적으로 조회되었습니다.'),
        401: unauthorizedSchema,
      },
    },
    getAllHistories: {
      method: 'GET',
      path: '/histories',
      description: '사서가 전체 대출 기록을 가져온다.',
      query: historiesGetQuerySchema,
      responses: {
        200: z.literal('대출 기록이 성공적으로 조회되었습니다.'),
        401: unauthorizedSchema,
      },
    },

  },
);