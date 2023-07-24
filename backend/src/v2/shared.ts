import { AppRoute } from '@ts-rest/core';
import { AppRouteOptions } from '@ts-rest/express';
import { match } from 'ts-pattern';
import { z } from 'zod';
import { positiveInt } from '~/v1/reviews/controller/reviews.type';

export type Role = 'user' | 'cadet' | 'librarian' | 'staff';
const fromEnum = (role: number): Role =>
  match(role)
    .with(0, () => 'user' as const)
    .with(1, () => 'cadet' as const)
    .with(2, () => 'librarian' as const)
    .with(3, () => 'staff' as const)
    .run();

export type ParsedUser = z.infer<typeof getUser>;
export const getUser = z.object({
  id: positiveInt,
  role: z.number().int().min(0).max(3).transform(fromEnum),
});

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

export class BookInfoNotFoundError extends Error {
  declare readonly _tag: 'BookInfoNotFoundError';
  constructor(bookInfoId: number) {
    super(`Could not find bookInfoId: ${bookInfoId}`);
  }
}
export type HandlerFor<T extends AppRoute> = AppRouteOptions<T>['handler'];
