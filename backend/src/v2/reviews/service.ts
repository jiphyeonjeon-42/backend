import { match } from 'ts-pattern';

import { BookInfoNotFoundError } from '~/v2/shared/errors';
import {
  ReviewDisabledError,
  ReviewForbiddenAccessError,
  ReviewNotFoundError,
} from './errors';
import { ParsedUser } from '~/v2/shared';
import {
  bookInfoExistsById,
  deleteReviewById,
  getReviewById,
  insertReview,
  toggleVisibilityById,
  updateReviewById,
} from './repository';

type CreateArgs = { bookInfoId: number; userId: number; content: string };
export const createReview = async (args: CreateArgs) => {
  const bookInfo = await bookInfoExistsById(args.bookInfoId);

  return await match(bookInfo)
    .with(false, () => new BookInfoNotFoundError(args.bookInfoId))
    .otherwise(() => insertReview(args));
};

type RemoveArgs = { reviewsId: number; deleter: ParsedUser };
export const removeReview = async ({ reviewsId, deleter }: RemoveArgs) => {
  const isAdmin = () => deleter.role === 'librarian';
  const doRemoveReview = () =>
    deleteReviewById({ reviewsId, deleteUserId: deleter.id });

  const review = await getReviewById(reviewsId);
  return match(review)
    .with(
      undefined,
      { isDeleted: true },
      () => new ReviewNotFoundError(reviewsId),
    )
    .when(isAdmin, doRemoveReview)
    .with({ userId: deleter.id }, doRemoveReview)
    .otherwise(
      () => new ReviewForbiddenAccessError({ userId: deleter.id, reviewsId }),
    );
};

type UpdateArgs = { reviewsId: number; userId: number; content: string };
export const updateReview = async ({
  reviewsId,
  userId,
  content,
}: UpdateArgs) => {
  const review = await getReviewById(reviewsId);

  return await match(review)
    .with(undefined, () => new ReviewNotFoundError(reviewsId))
    .with({ disabled: true }, () => new ReviewDisabledError(reviewsId))
    .with({ userId }, () => updateReviewById({ reviewsId, userId, content }))
    .otherwise(() => new ReviewForbiddenAccessError({ userId, reviewsId }));
};

type ToggleReviewArgs = { reviewsId: number; userId: number };
export const toggleReviewVisibility = async ({
  reviewsId,
  userId,
}: ToggleReviewArgs) => {
  const review = await getReviewById(reviewsId);

  return await match(review)
    .with(undefined, () => new ReviewNotFoundError(reviewsId))
    .otherwise(({ disabled }) =>
      toggleVisibilityById({ reviewsId, userId, disabled }),
    );
};
