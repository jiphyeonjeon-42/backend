import { initContract } from '@ts-rest/core';
import { badRequestSchema } from '../shared';
import {
  searchUserSchema,
  searchUserResponseSchema,
  createUserSchema,
  createUserResponseSchema,
  userIdSchema,
  updateUserSchema,
} from './schema';

export * from './schema';

const c = initContract();

export const usersContract = c.router(
  {
    get: {
      method: 'GET',
      path: '/',
      summary: '유저 정보를 검색해 온다. query가 null이면 모든 유저를 검색한다.',
      query: searchUserSchema,
      responses: {
        200: searchUserResponseSchema,
        400: badRequestSchema,
      },
    },
    post: {
      method: 'POST',
      path: '/',
      summary: '유저를 생성한다.',
      body: createUserSchema,
      responses: {
        201: createUserResponseSchema,
        400: badRequestSchema,
      },
    },
    patch: {
      method: 'PATCH',
      path: '/:id',
      summary: '유저 정보를 변경한다.',
      pathParams: userIdSchema,
      body: updateUserSchema,
      responses: {
        200: updateUserSchema,
        400: badRequestSchema,
      },
    },
  },
  { pathPrefix: '/users' },
);
