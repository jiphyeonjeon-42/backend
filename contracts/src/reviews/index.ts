import { initContract } from '@ts-rest/core';
import { contentSchema, reviewsIdPathSchema } from './schema';
import { z } from '../zodWithOpenapi';

const notFoundResponseSchema = z.object({
  code: z.literal('REVIEWS_NOT_FOUND'),
  message: z.literal('검색한 리뷰가 존재하지 않습니다.'),
});

//  contract 를 생성할 때, router 함수를 사용하여 api 를 생성
const c = initContract();

export const reviewsContract = c.router(
  {
    patch: {
      method: 'PATCH',
      path: '/:reviewsId',
      pathParams: reviewsIdPathSchema,
      description: '책 리뷰의 비활성화 여부를 토글 방식으로 변환합니다.',
      body: null,
      responses: {
        200: z.literal('리뷰 공개 여부가 업데이트되었습니다.'),
        404: notFoundResponseSchema,
      },
    },
    put: {
      method: 'PUT',
      path: '/:reviewsId',
      pathParams: reviewsIdPathSchema,
      description: '책 리뷰를 수정합니다. 작성자 또는 관리자만 수정 가능합니다.',
      body: contentSchema,
      responses: {
        200: z.literal('리뷰가 수정되었습니다.'),
        404: notFoundResponseSchema,
      },
    },
  },
  //  pathPrefix 를 통해 모든 경로에 공통적으로 /reviews 를 붙여줍니다.
  //  여러 api 마다 공통적으로 /reviews/~~~ 를 사용하니까 중복해서 선언하는 것을 방지하기 위함.
  { pathPrefix: '/reviews' },
);
