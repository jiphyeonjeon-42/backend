/* eslint-disable import/prefer-default-export */
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { reviewsIdSchema } from './reviews';

//  zod 스키마를 확장하여 openapi 스키마를 생성
//  openapi == swagger
extendZodWithOpenApi(z);

//  initContract 함수를 통해 contract 를 생성
const c = initContract();

//  contract 를 생성할 때, router 함수를 사용하여 api 를 생성
export const reviewsContract = c.router(
  {
    patch: {
      method: 'PATCH',
      path: '/:reviewsId',
      description: '책 리뷰의 비활성화 여부를 토글 방식으로 변환합니다.',
      pathParams: z.object({
        //  zod 스키마
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
  //  pathPrefix 를 통해 모든 경로에 공통적으로 /reviews 를 붙여줍니다.
  //  여러 api 마다 공통적으로 /reviews/~~~ 를 사용하니까 중복해서 선언하는 것을 방지하기 위함.
  { pathPrefix: '/reviews' },
);

//  다른 contract 를 모아서 하나의 contract 로 만들기.
export const contract = c.router(
  {
    reviews: reviewsContract,
  },
  {
    pathPrefix: '/api/v2',
    strictStatusCodes: true,
  },
);
