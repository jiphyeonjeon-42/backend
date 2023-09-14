import { initContract } from '@ts-rest/core';
import { reviewsContract } from './reviews';
import { lendingsContract } from './lendings/mod';
import { usersContract } from './users';
import { likesContract } from './likes';
import { booksContract } from './books';

export * from './reviews';
export * from './shared';

const c = initContract();

//  다른 contract 를 모아서 하나의 contract 로 만들기.
export const contract = c.router(
  {
    // likes: likesContract,
    reviews: reviewsContract,
    lendings: lendingsContract,
    books: booksContract,
    // TODO(@scarf005): 유저 서비스 작성
    //     users: usersContract,
  },
  {
    pathPrefix: '/api/v2',
    strictStatusCodes: true,
  },
);
