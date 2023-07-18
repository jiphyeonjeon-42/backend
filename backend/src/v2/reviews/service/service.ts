/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-extraneous-dependencies */
import { match } from 'ts-pattern';

import type { Repository } from 'typeorm';
import BookInfo from '~/entity/entities/BookInfo';
import Reviews from '~/entity/entities/Reviews';

import { BookInfoNotFoundError } from '~/v2/shared/errors';
import type { ReviewsService } from '.';
import { ReviewDisabledError, ReviewForbiddenAccessError, ReviewNotFoundError } from './errors';

type Repos = { reviews: Repository<Reviews> };

type MkCreateReview = (
  repos: Repos & { bookInfo: Repository<BookInfo> },
) => ReviewsService['createReview'];
export const mkCreateReview: MkCreateReview =
  ({ reviews, bookInfo }) =>
  async ({ bookInfoId, userId, content }) =>
    match(await bookInfo.findOneBy({ id: bookInfoId }))
      .with(null, () => new BookInfoNotFoundError(bookInfoId))
      .otherwise(() =>
        reviews.insert({
          userId,
          updateUserId: userId,
          bookInfoId,
          content,
        }),
      );

type MkRemoveReview = (repos: Repos) => ReviewsService['removeReview'];
export const mkRemoveReview: MkRemoveReview =
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

type MkUpdateReview = (repos: Repos) => ReviewsService['updateReview'];
export const mkUpdateReview: MkUpdateReview =
  ({ reviews }) =>
  async ({ reviewsId, userId, content }) => {
    const review = await reviews.findOneBy({ id: reviewsId });

    return match(review)
      .with(null, () => new ReviewNotFoundError(reviewsId))
      .with({ disabled: true }, () => new ReviewDisabledError(reviewsId))
      .with({ userId }, () => reviews.update(reviewsId, { content, updateUserId: userId }))
      .otherwise(() => new ReviewForbiddenAccessError({ userId, reviewsId }));
  };

type MkToggleReviewVisibility = (repos: Repos) => ReviewsService['toggleReviewVisibility'];
export const mkToggleReviewVisibility: MkToggleReviewVisibility =
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
