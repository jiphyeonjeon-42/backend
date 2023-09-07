import { bookInfoNotFoundSchema, reviewNotFoundSchema, unauthorizedSchema, bookNotFoundSchema } from '@jiphyeonjeon-42/contracts';
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

export const bookNotFound = {
  status: 404,
  body: {
    code: 'BOOK_NOT_FOUND',
    description: '검색한 책이 존재하지 않습니다.',
  } as z.infer<typeof bookNotFoundSchema>,
} as const;

export const pubdateFormatError = {
  status: 311,
  body: {
    code: 'PUBDATE_FORMAT_ERROR',
    description: '입력한 pubdate가 알맞은 형식이 아님.'
  }
} as const;

export const isbnNotFound = {
  status: 303,
  body: {
    code: 'ISBN_NOT_FOUND',
    description: '국립중앙도서관 API에서 ISBN 검색이 실패하였습니다.'
  }
} as const;

export const naverBookNotFound = {
  status: 310,
  body: {
    code: 'NAVER_BOOK_NOT_FOUND',
    description: '네이버 책검색 API에서 ISBN 검색이 실패'
  }
} as const;