/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-extraneous-dependencies */
import { match } from 'ts-pattern';

import { Repository, type InsertResult, type UpdateResult } from 'typeorm';
import Reviews from '~/entity/entities/Reviews';

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
  constructor({ userId, reviewsId }: {userId: number, reviewsId: number}) {
    super(`user ${userId} does not have permission to access reviewsId: ${reviewsId}`);
  }
}

export class BookInfoNotFoundError extends Error {
  constructor(bookInfoId: number) {
    super(`Could not find bookInfoId: ${bookInfoId}`);
  }
}

type RepoDeps = { reviews: Repository<Reviews> }

type MkCreateReviews = (deps: RepoDeps) => IReviewsService['createReviews']

export const mkCreateReviews: MkCreateReviews = ({ reviews }) =>
  async ({ bookInfoId, userId, content }) =>
    match(await reviews.findOneBy({ id: bookInfoId }))
      .with(null, () => new BookInfoNotFoundError(bookInfoId))
      .otherwise(() => reviews.insert({ userId, updateUserId: userId, bookInfoId, content }));

export type Args = { bookInfoId: number, reviewsId: number, userId: number, content: string }
export type createArgs = { userId: number, bookInfoId: number, content: string }
export type updateArgs = { reviewsId: number, userId: number, content: string }

// TODO: 객체 타입 추출
export type IReviewsService ={
  createReviews: (args: Omit<Args, 'reviewsId'>) => Promise<BookInfoNotFoundError | InsertResult>
  updateReviews: (args: Omit<Args, 'bookInfoId'>) => Promise<ReviewNotFoundError | UpdateResult>
  deleteReviews: (args: Pick<Args, 'reviewsId'> & {deleteUserId: number} ) => Promise<void>
  patchReviews: (args: Pick<Args, 'reviewsId' | 'userId'>) => Promise<ReviewNotFoundError | UpdateResult>
}
export default class ReviewsService {
  // eslint-disable-next-line no-empty-function, no-useless-constructor
  constructor(private readonly repo : Repository<Reviews>) {}

  async createReviews(
    { bookInfoId, userId, content }: {userId: number, bookInfoId: number, content: string},
  ) {
    const bookInfo = await this.repo.findOneBy({ id: bookInfoId });
    return match(bookInfo)
      .with(null, () => new BookInfoNotFoundError(bookInfoId))
      .otherwise(() => this.repo.insert({
        userId, updateUserId: userId, bookInfoId, content,
      }));
  }

  async updateReviews({ reviewsId, userId, content }: updateArgs) {
    const review = await this.repo.findOneBy({ id: reviewsId });
    return match(review)
      .with(null, () => new ReviewNotFoundError(reviewsId))
      .with({ disabled: true }, () => new ReviewDisabledError(reviewsId))
      .with({ userId }, () => this.repo.update(reviewsId, { content, updateUserId: userId }))
      .otherwise(() => new ReviewForbiddenAccessError({ userId, reviewsId }));
  }

  /** 도서 리뷰를 soft delete합니다.
   * TODO: {@link Repository.softDelete} 사용?
   */
  async deleteReviews(reviewId: number, deleteUserId: number) {
    await this.repo.update(reviewId, { deleteUserId, isDeleted: true });
  }

  /** 리뷰 공개/비공개 여부를 전환합니다. */
  async patchReviews({ reviewsId, userId }: { reviewsId: number, userId: number }) {
    const review = await this.repo.findOne({
      select: { disabled: true, disabledUserId: true },
      where: { id: reviewsId },
    });

    /** TODO: {@link Repository.save} 사용? */
    return match(review)
      .with(null, () => new ReviewNotFoundError(reviewsId))
      .otherwise(async ({ disabled }) =>
        this.repo.update(reviewsId, {
          disabled: !disabled,
          disabledUserId: disabled ? null : userId,
        }));
  }
}
