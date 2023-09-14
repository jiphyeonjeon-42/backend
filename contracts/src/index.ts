import { initContract } from '@ts-rest/core';
import { reviewsContract } from './reviews';
import { historiesContract } from './histories';
import { usersContract } from './users';
import { likesContract } from './likes';
import { tagContract } from './tags';
import { booksContract } from './books';

export * from './reviews';
export * from './shared';

const c = initContract();

//  다른 contract 를 모아서 하나의 contract 로 만들기.
export const contract = c.router(
  {
    // likes: likesContract,
    reviews: reviewsContract,
    histories: historiesContract,
    books: booksContract,
    // TODO(@nyj001012): 태그 서비스 작성
    // tags: tagContract,
    // TODO(@scarf005): 유저 서비스 작성
    //     users: usersContract,
  },
  {
    pathPrefix: '/api/v2',
    strictStatusCodes: true,
  },
);
