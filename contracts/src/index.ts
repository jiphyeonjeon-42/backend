import { initContract } from '@ts-rest/core';
import { reviewsContract } from './reviews';
import { historiesContract } from './histories';
import { likesContract } from './likes';

export * from './reviews';
export * from './shared';

const c = initContract();

//  다른 contract 를 모아서 하나의 contract 로 만들기.
export const contract = c.router(
  {
    // likes: likesContract,
    reviews: reviewsContract,
    histories: historiesContract,

  },
  {
    pathPrefix: '/api/v2',
    strictStatusCodes: true,
  },
);
