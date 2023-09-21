import { initContract } from '@ts-rest/core';
import {
  searchAllBooksQuerySchema,
  searchAllBooksResponseSchema,
  searchBookByIdResponseSchema,
  pubdateFormatErrorSchema,
  updateBookBodySchema,
  updateBookResponseSchema,
  unknownPatchErrorSchema,
  nonDataErrorSchema,
  searchBookInfoByIdResponseSchema,
  searchBookInfoByIdPathSchema,
  searchBookByIdParamSchema,
} from './schema';
import { badRequestSchema, bookInfoNotFoundSchema, bookNotFoundSchema } from '../shared';

const c = initContract();

export const bookMetasContracts = c.router(
  {
    getById: {
      method: 'GET',
      path: '/info/:id',
      pathParams: searchBookInfoByIdPathSchema,
      summary: '도서 정보를 조회합니다.',
      responses: {
        200: searchBookInfoByIdResponseSchema,
        404: bookInfoNotFoundSchema,
      },
    },
  },
  { pathPrefix: '/bookmetas' },
);

export const booksContract = c.router(
  {
    getById: {
      method: 'GET',
      path: '/:id',
      summary: 'book테이블의 ID기준으로 책 한 종류의 정보를 가져온다.',
      pathParams: searchBookByIdParamSchema,
      responses: {
        200: searchBookByIdResponseSchema,
        404: bookNotFoundSchema,
      },
    },
    get: {
      method: 'GET',
      path: '/',
      summary: '개별 책 정보(book)를 검색하여 가져온다. 책이 대출할 수 있는지 확인 할 수 있음',
      query: searchAllBooksQuerySchema,
      responses: {
        200: searchAllBooksResponseSchema,
        400: badRequestSchema,
      },
    },
    patch: {
      method: 'PATCH',
      path: '/update',
      summary: '책 정보 하나를 수정합니다.',
      body: updateBookBodySchema,
      responses: {
        204: updateBookResponseSchema,
        312: unknownPatchErrorSchema,
        313: nonDataErrorSchema,
        311: pubdateFormatErrorSchema,
      },
    },
  },
  { pathPrefix: '/books' },
);
