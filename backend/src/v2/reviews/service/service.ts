/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-extraneous-dependencies */
import { match } from 'ts-pattern';

import type { KyDB } from '~/v2/database';

import type { Kysely } from 'kysely';
import { executeWithOffsetPagination } from 'kysely-paginate';
import { BookInfoNotFoundError } from '~/v2/shared/errors';
import type { ReviewsService } from '.';
import { ReviewDisabledError, ReviewForbiddenAccessError, ReviewNotFoundError } from './errors';

/** {@link Kysely} 의존성을 가진 {@link ReviewsService}에 속한 함수 생성 */
type ServiceFor<T extends keyof ReviewsService> = (db: KyDB) => ReviewsService[T];

export const searchReviews: ServiceFor<'searchReviews'> =
  (db) =>
  ({ query, visibility, page, perPage, sort }) => {
    const searchQuery = db.selectFrom('reviews')
      .leftJoin('user', 'user.id', 'reviews.userId')
      .leftJoin('book_info', 'book_info.id', 'reviews.bookInfoId')
      .select([
        'id',
        'userId',
        'bookInfoId',
        'content',
        'createdAt',
        'book_info.title',
        'user.nickname',
        'user.intraId',
      ])
      .where('content', 'like', `%${query}%`)
      .orderBy('updatedAt', sort)

    const withVisibility = match(visibility)
      .with('public', () => searchQuery.where('disabled', '=', false))
      .with('private', () => searchQuery.where('disabled', '=', true))
      .with('all', () => searchQuery)
      .exhaustive()

    return executeWithOffsetPagination(withVisibility, { page, perPage })
  }

export const mkCreateReview: ServiceFor<'createReview'> =
  (db) =>
  async ({ bookInfoId, userId, content }) =>{
    const bookInfo = await db
      .selectFrom('book_info')
      .where('id', '=', bookInfoId)
      .executeTakeFirst()

    match(bookInfo)
      .with(undefined, () => new BookInfoNotFoundError(bookInfoId))
      .otherwise(() =>
        db
          .insertInto('reviews')
          .values({
            userId,
            updateUserId: userId,
            bookInfoId,
            content,
            disabled: false,
            isDeleted: false,
            createdAt: new Date(),
          })
          .executeTakeFirst(),
      )}

export const mkRemoveReview: ServiceFor<'removeReview'> =
  (db) =>
  async ({ reviewsId, deleter }) => {
    const isAdmin = () => deleter.role === 'librarian';
    const deleteFn = () => db.updateTable('reviews')
      .where('id', '=', reviewsId)
      .set({
        deleteUserId: deleter.id,
        isDeleted: true,
      })
      .executeTakeFirst();

    const review = await db
      .selectFrom('reviews')
      .where('id', '=', reviewsId)
      .select(['userId', 'isDeleted'])
      .executeTakeFirst();

    return match(review)
      .with(undefined, { isDeleted: true }, () => new ReviewNotFoundError(reviewsId))
      .when(isAdmin, deleteFn)
      .with({ userId: deleter.id }, deleteFn)
      .otherwise(() => new ReviewForbiddenAccessError({ userId: deleter.id, reviewsId }));
  };


export const mkUpdateReview: ServiceFor<'updateReview'> =
  (db) =>
  async ({ reviewsId, userId, content }) => {
    const review = await db
      .selectFrom('reviews')
      .where('id', '=', userId)
      .select(['disabled', 'disabledUserId', 'userId'])
      .executeTakeFirst()

    return match(review)
      .with(undefined, () => new ReviewNotFoundError(reviewsId))
      .with({ disabled: true }, () => new ReviewDisabledError(reviewsId))
      .with({ userId }, () =>
        db
          .updateTable('reviews')
          .where('id', '=', reviewsId)
          .set({ content, updateUserId: userId })
          .executeTakeFirst()
      )
      .otherwise(() => new ReviewForbiddenAccessError({ userId, reviewsId }));
  }


export const mkToggleReviewVisibility: ServiceFor<'toggleReviewVisibility'> =
  (db) =>
  async ({ reviewsId, userId }) => {
    const review = await db
      .selectFrom('reviews')
      .where('id', '=', userId)
      .select(['disabled', 'disabledUserId'])
      .executeTakeFirst()

    return match(review)
      .with(undefined, () => new ReviewNotFoundError(reviewsId))
      .otherwise(({ disabled }) => {
        db.updateTable('reviews')
          .where('id', '=', reviewsId)
          .set({
            disabled: !disabled,
            disabledUserId: disabled ? null : userId,
          })
          .execute()
      });
  };
