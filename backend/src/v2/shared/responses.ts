import { bookNotFoundSchema, bookInfoNotFoundSchema, reviewNotFoundSchema } from '@jiphyeonjeon-42/contracts';
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

export const bookNotFound = {
  status: 404,
  body: {
    code: 'BOOK_NOT_FOUND',
    description: '검색한 책이 존재하지 않습니다.',
  } as z.infer<typeof bookNotFoundSchema>,
} as const;
