import { z } from 'zod';
import { positiveInt } from '~/v1/reviews/controller/reviews.type';

export const getUser = z.object({ id: positiveInt });
export const reviewNotFound = {
  status: 404,
  body: {
    code: 'REVIEWS_NOT_FOUND',
    message: '검색한 리뷰가 존재하지 않습니다.',
  },
} as const;

export const bookInfoNotFound = {
  status: 404,
  body: {
    code: 'BOOK_INFO_NOT_FOUND',
    message: '검색한 책이 존재하지 않습니다.',
  },
} as const;
