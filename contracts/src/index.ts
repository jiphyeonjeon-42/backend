import { initContract } from '@ts-rest/core';
import { reviewsContract } from './reviews';
import { historiesContract } from './histories';
import { usersContract } from './users';
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
    histories: historiesContract,

    stock: stockContract,
//     users: usersContract, TODO: 유저 라우터 작성
  },
  {
    pathPrefix: '/api/v2',
    strictStatusCodes: true,
  },
);
