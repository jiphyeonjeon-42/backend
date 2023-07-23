/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-extraneous-dependencies */
import { match } from 'ts-pattern';

import { Repository, type InsertResult, type UpdateResult } from 'typeorm';
import Reviews from '~/entity/entities/Reviews';
import { BookInfoNotFoundError } from '../shared';
import BookInfo from '~/entity/entities/BookInfo';

export class ReviewNotFoundError extends Error {
  constructor(reviewsId: number) {
    super(`Could not find reviewsId: ${reviewsId}`);
  }
}

export class ReviewDisabledError extends Error {
  constructor(reviewsId: number) {
    super(`reviewsId: ${reviewsId} is disabled and cannot be updated`);
  }
}

export class ReviewForbiddenAccessError extends Error {
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
  async ({ bookInfoId, userId, content }) => {
    const result = await bookInfo.findOneBy({ id: bookInfoId });
    console.log(result, bookInfoId);
    return match(result)
      .with(null, () => new BookInfoNotFoundError(bookInfoId))
      .otherwise(() => reviews.insert({ userId, updateUserId: userId, bookInfoId, content }));
  };

type MkDeleteReviews = (deps: RepoDeps) => ReviewsService['deleteReviews'];
export const mkDeleteReviews: MkDeleteReviews =
  ({ reviews }) =>
  async ({ reviewsId, deleteUserId }) => {
    reviews.update(reviewsId, { deleteUserId, isDeleted: true });
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
    const review = await reviews.findOne({
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
  updateReviews: (args: Omit<Args, 'bookInfoId'>) => Promise<ReviewNotFoundError | UpdateResult>;
  deleteReviews: (args: Pick<Args, 'reviewsId'> & { deleteUserId: number }) => Promise<void>;
  patchReviews: (args: patchArgs) => Promise<ReviewNotFoundError | UpdateResult>;
};
