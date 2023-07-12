import { initContract } from '@ts-rest/core';
import { reviewsContract } from './reviews';

//  initContract 함수를 통해 contract 를 생성
const c = initContract();

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
