import { initContract } from '@ts-rest/core';
import { reviewsContract } from './reviews';
import { likesContract } from './likes';
import { stockContract } from './stock';

export * from './reviews';
export * from './shared';

const c = initContract();

//  다른 contract 를 모아서 하나의 contract 로 만들기.
export const contract = c.router(
  {
    // likes: likesContract,
    reviews: reviewsContract,
    stock: stockContract,
  },
  {
    pathPrefix: '/api/v2',
    strictStatusCodes: true,
  },
);
