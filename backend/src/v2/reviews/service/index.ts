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
  createReview: (
    args: Pick<Args, 'bookInfoId' | 'userId' | 'content'>,
  ) => Promise<BookInfoNotFoundError | InsertResult>;
  updateReview: (
    args: Pick<Args, 'reviewsId' | 'userId' | 'content'>,
  ) => Promise<
    ReviewForbiddenAccessError | ReviewNotFoundError | ReviewDisabledError | UpdateResult
  >;
  removeReview: (
    args: Pick<Args, 'reviewsId' | 'deleter'>,
  ) => Promise<
    ReviewForbiddenAccessError | ReviewNotFoundError | ReviewDisabledError | UpdateResult
  >;
  toggleReviewVisibility: (
    args: Pick<Args, 'reviewsId' | 'userId'>,
  ) => Promise<ReviewNotFoundError | UpdateResult>;
};

export * from './service';
