/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-extraneous-dependencies */
import { match } from 'ts-pattern';

import type { Repository, InsertResult, UpdateResult } from 'typeorm';
import Reviews from '~/entity/entities/Reviews';
import BookInfo from '~/entity/entities/BookInfo';

import { BookInfoNotFoundError, ParsedUser } from '../shared';

export class ReviewNotFoundError extends Error {
  declare readonly _tag: 'ReviewNotFoundError';
  constructor(reviewsId: number) {
    super(`Could not find reviewsId: ${reviewsId}`);
  }
}

export class ReviewDisabledError extends Error {
  declare readonly _tag: 'ReviewDisabledError';
  constructor(reviewsId: number) {
    super(`reviewsId: ${reviewsId} is disabled and cannot be updated`);
  }
}

export class ReviewForbiddenAccessError extends Error {
  declare readonly _tag: 'ReviewForbiddenAccessError';
  constructor({ userId, reviewsId }: { userId: number; reviewsId: number }) {
    super(`user ${userId} does not have permission to access reviewsId: ${reviewsId}`);
  }
}

type RepoDeps = { reviews: Repository<Reviews> };

type MkCreateReviews = (
  deps: RepoDeps & { bookInfo: Repository<BookInfo> },
) => ReviewsService['createReviews'];
export const mkCreateReviews: MkCreateReviews =
  ({ reviews, bookInfo }) =>
  async ({ bookInfoId, userId, content }) =>
    match(await bookInfo.findOneBy({ id: bookInfoId }))
      .with(null, () => new BookInfoNotFoundError(bookInfoId))
      .otherwise(() => reviews.insert({ userId, updateUserId: userId, bookInfoId, content }));

type MkDeleteReviews = (deps: RepoDeps) => ReviewsService['deleteReviews'];
export const mkDeleteReviews: MkDeleteReviews =
  ({ reviews }) =>
  async ({ reviewsId, deleter }) => {
    const isAdmin = () => deleter.role === 'librarian';
    const deleteFn = () => reviews.update(reviewsId, { deleteUserId: deleter.id, isDeleted: true });

    const review = await reviews.findOneBy({ id: reviewsId });
    return match(review)
      .with(null, { isDeleted: true }, () => new ReviewNotFoundError(reviewsId))
      .when(isAdmin, deleteFn)
      .with({ userId: deleter.id }, deleteFn)
      .otherwise(() => new ReviewForbiddenAccessError({ userId: deleter.id, reviewsId }));
  };

type MkUpdateReviews = (deps: RepoDeps) => ReviewsService['updateReviews'];
export const mkUpdateReviews: MkUpdateReviews =
  ({ reviews }) =>
  async ({ reviewsId, userId, content }) => {
    const review = await reviews.findOneBy({ id: reviewsId });

    return match(review)
      .with(null, () => new ReviewNotFoundError(reviewsId))
      .with({ disabled: true }, () => new ReviewDisabledError(reviewsId))
      .with({ userId }, () => reviews.update(reviewsId, { content, updateUserId: userId }))
      .otherwise(() => new ReviewForbiddenAccessError({ userId, reviewsId }));
  };

type MkPatchReviews = (deps: RepoDeps) => ReviewsService['patchReviews'];
export const mkPatchReviews: MkPatchReviews =
  ({ reviews }) =>
  async ({ reviewsId, userId }) => {
    type Queried = Pick<Reviews, 'disabled' | 'disabledUserId'> | null;
    const review: Queried = await reviews.findOne({
      select: { disabled: true, disabledUserId: true },
      where: { id: reviewsId },
    });
    return match(review)
      .with(null, () => new ReviewNotFoundError(reviewsId))
      .otherwise(async ({ disabled }) =>
        reviews.update(reviewsId, {
          disabled: !disabled,
          disabledUserId: disabled ? null : userId,
        }),
      );
  };

export type Args = { bookInfoId: number; reviewsId: number; userId: number; content: string };
export type createArgs = { userId: number; bookInfoId: number; content: string };
export type updateArgs = { reviewsId: number; userId: number; content: string };
export type patchArgs = Pick<Args, 'reviewsId' | 'userId'>;

export type ReviewsService = {
  createReviews: (args: Omit<Args, 'reviewsId'>) => Promise<BookInfoNotFoundError | InsertResult>;
  updateReviews: (
    args: Omit<Args, 'bookInfoId'>,
  ) => Promise<
    ReviewForbiddenAccessError | ReviewNotFoundError | ReviewDisabledError | UpdateResult
  >;
  deleteReviews: (
    args: Pick<Args, 'reviewsId'> & { deleter: ParsedUser },
  ) => Promise<
    ReviewForbiddenAccessError | ReviewNotFoundError | ReviewDisabledError | UpdateResult
  >;
  patchReviews: (args: patchArgs) => Promise<ReviewNotFoundError | UpdateResult>;
};
