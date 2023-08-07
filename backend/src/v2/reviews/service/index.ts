import type { InsertResult, UpdateResult } from 'typeorm';
import { BookInfoNotFoundError, ParsedUser } from '~/v2/shared';
import { ReviewDisabledError, ReviewForbiddenAccessError, ReviewNotFoundError } from './errors';

type Args = {
  bookInfoId: number;
  reviewsId: number;
  userId: number;
  content: string;
  deleter: ParsedUser;
};

export type ReviewsService = {
  searchReviews: (
    args: {
      query: string,
      page: number,
      perPage: number,
      visibility: 'public' | 'private' | 'all',
      sort: 'asc' | 'desc',
    }
  ) => Promise<unknown>,
  createReview: (
    args: Pick<Args, 'bookInfoId' | 'userId' | 'content'>,
  ) => Promise<BookInfoNotFoundError | unknown>;
  updateReview: (
    args: Pick<Args, 'reviewsId' | 'userId' | 'content'>,
  ) => Promise<
    ReviewForbiddenAccessError | ReviewNotFoundError | ReviewDisabledError | unknown
  >;
  removeReview: (
    args: Pick<Args, 'reviewsId' | 'deleter'>,
  ) => Promise<
    ReviewForbiddenAccessError | ReviewNotFoundError | ReviewDisabledError | unknown
  >;
  toggleReviewVisibility: (
    args: Pick<Args, 'reviewsId' | 'userId'>,
  ) => Promise<ReviewNotFoundError | unknown>;
};

export * from './service';
