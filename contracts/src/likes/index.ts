import { initContract } from '@ts-rest/core';
import { bookInfoIdSchema, bookInfoNotFoundSchema, nonNegativeInt } from '../shared';
import { z } from '../zodWithOpenapi';
import { likeNotFoundSchema, likeResponseSchema } from './schema';

const c = initContract();

export const likesContract = c.router(
  {
    post: {
      method: 'POST',
      path: '/:bookInfoId/like',
      summary: '책에 좋아요를 누릅니다.',
      pathParams: z.object({ bookInfoId: bookInfoIdSchema }),
      body: null,
      responses: {
        200: z.object({
          userId: nonNegativeInt,
          bookInfoId: bookInfoIdSchema,
        }),
      },
    },
    get: {
      method: 'GET',
      path: '/:bookInfoId/like',
      summary: '좋아요 개수를 가져옵니다.',
      pathParams: z.object({ bookInfoId: bookInfoIdSchema }),
      responses: {
        200: likeResponseSchema,
        404: bookInfoNotFoundSchema,
      },
    },
    delete: {
      method: 'DELETE',
      path: '/:bookInfoId/like',
      summary: '좋아요를 취소합니다',
      pathParams: z.object({ bookInfoId: bookInfoIdSchema }),
      body: null,
      responses: {
        204: null,
        404: z.union([likeNotFoundSchema, bookInfoNotFoundSchema]),
      },
    },
  },
  { pathPrefix: '/books/info' },
);
