import { initContract } from '@ts-rest/core';
import { badRequestSchema, serverErrorSchema } from '../shared';
import {
  searchUserSchema,
  searchUserResponseSchema,
  createUserSchema,
  createUserResponseSchema,
} from './schema';

export * from './schema';

const c = initContract();

export const usersContract = c.router(
  {
    get: {
      method: 'GET',
      path: '/search',
      query: searchUserSchema,
      description: '유저 정보를 검색해 온다. query가 null이면 모든 유저를 검색한다.',
      responses: {
        200: searchUserResponseSchema,
        400: badRequestSchema,
        500: serverErrorSchema,
      },
    },
    post: {
      method: 'POST',
      path: '/create',
      body: createUserSchema,
      description: '유저를 생성한다.',
      responses: {
        201: createUserResponseSchema,
        400: badRequestSchema,
        500: serverErrorSchema,
      },
    },
  },
  { pathPrefix: '/users' },
);
