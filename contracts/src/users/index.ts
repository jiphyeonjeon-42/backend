import { initContract } from '@ts-rest/core';
import { badRequestSchema, forbiddenSchema } from '../shared';
import {
  searchUserSchema,
  searchUserResponseSchema,
  createUserSchema,
  createUserResponseSchema,
  userIdSchema,
  updateUserSchema,
  updatePrivateInfoSchema,
  updateUserResponseSchema,
} from './schema';

export * from './schema';

const c = initContract();

export const usersContract = c.router(
  {
    searchUser: {
      method: 'GET',
      path: '/search',
      description: '유저 정보를 검색해 온다. query가 null이면 모든 유저를 검색한다.',
      query: searchUserSchema,
      responses: {
        200: searchUserResponseSchema,
        400: badRequestSchema,
      },
    },
    createUser: {
      method: 'POST',
      path: '/create',
      description: '유저를 생성한다.',
      body: createUserSchema,
      responses: {
        201: createUserResponseSchema,
        400: badRequestSchema,
      },
    },
    updateUser: {
      method: 'PATCH',
      path: '/update/:id',
      description: '유저 정보를 변경한다.',
      pathParams: userIdSchema,
      body: updateUserSchema,
      responses: {
        200: updateUserSchema,
        400: badRequestSchema,
      },
    },
    updatePrivateInfo: {
      method: 'PATCH',
      path: '/myupdate',
      description: '유저의 정보를 변경한다.',
      body: updatePrivateInfoSchema,
      responses: {
        200: updateUserResponseSchema,
        400: badRequestSchema,
        403: forbiddenSchema,
      },
    },
  },
  { pathPrefix: '/users' },
);
