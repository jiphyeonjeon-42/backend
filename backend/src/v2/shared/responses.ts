import { bookInfoNotFoundSchema, reviewNotFoundSchema, unauthorizedSchema } from '@jiphyeonjeon-42/contracts';
import { z } from 'zod';

export const reviewNotFound = {
  status: 404,
  body: {
    code: 'REVIEW_NOT_FOUND',
    description: '검색한 리뷰가 존재하지 않습니다.',
  } as z.infer<typeof reviewNotFoundSchema>,
} as const;

export const bookInfoNotFound = {
  status: 404,
  body: {
    code: 'BOOK_INFO_NOT_FOUND',
    description: '검색한 책이 존재하지 않습니다.',
  } as z.infer<typeof bookInfoNotFoundSchema>,
} as const;

export const unauthorized = {
  status: 401,
  body: {
    code: 'UNAUTHORIZED',
    description: '권한이 없습니다.',
  } as z.infer<typeof unauthorizedSchema>,
} as const;
