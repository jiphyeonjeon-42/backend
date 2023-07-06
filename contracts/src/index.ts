/* eslint-disable import/prefer-default-export */
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { reviewsIdSchema } from './reviews';

extendZodWithOpenApi(z);

const c = initContract();

export const reviewsContract = c.router(
  {
    patch: {
      method: 'PATCH',
      path: '/:reviewsId',
      description: '책 리뷰의 비활성화 여부를 토글 방식으로 변환합니다.',
      pathParams: z.object({
        reviewsId: reviewsIdSchema.openapi({ example: 1 }),
      }),
      body: null,
      responses: {
        200: z.literal('리뷰 공개 여부가 업데이트되었습니다.'),
        401: z.object({
          errorCode: z.number().int().nonnegative().openapi({ example: 102 }),
        }).describe('인증 미들웨어에서 인증이 실패했습니다.'),
        404: z.object({
          code: z.literal('NOT_FOUND_REVIEWS'),
          message: z.literal('검색한 리뷰가 존재하지 않습니다.'),
        }),
      },
    },
  },
  { pathPrefix: '/reviews' },
);

export const contract = c.router(
  {
    reviews: reviewsContract,
  },
  {
    pathPrefix: '/api/v2',
    strictStatusCodes: true,
  },
);
