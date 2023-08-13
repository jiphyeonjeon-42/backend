import { match } from 'ts-pattern';

import { BookInfoNotFoundError } from '~/v2/shared/errors';
import {
  ReviewDisabledError,
  ReviewForbiddenAccessError,
  ReviewNotFoundError,
} from './errors';
import { ParsedUser } from '~/v2/shared';
import {
  bookInfoRepo,
  findDisabledReviewById,
  reviewsRepo,
  toggleReviewVisibilityById,
} from './repository';
import { removeReviewById } from './repository';

type CreateArgs = { bookInfoId: number; userId: number; content: string };
export const createReview = async ({
  bookInfoId,
  userId,
  content,
}: CreateArgs) => {
  const bookInfo = await bookInfoRepo.findOneBy({ id: bookInfoId });

  return match(bookInfo)
    .with(null, () => new BookInfoNotFoundError(bookInfoId))
    .otherwise(({ id: bookInfoId }) =>
      reviewsRepo.insert({ userId, updateUserId: userId, bookInfoId, content }),
    );
};

type RemoveArgs = { reviewsId: number; deleter: ParsedUser };
export const removeReview = async ({ reviewsId, deleter }: RemoveArgs) => {
  const isAdmin = () => deleter.role === 'librarian';
  const doRemoveReview = () =>
    removeReviewById({ reviewsId, deleteUserId: deleter.id });

  const review = await reviewsRepo.findOneBy({ id: reviewsId });
  return match(review)
    .with(null, { isDeleted: true }, () => new ReviewNotFoundError(reviewsId))
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
  const review = await reviewsRepo.findOneBy({ id: reviewsId });

  return match(review)
    .with(null, () => new ReviewNotFoundError(reviewsId))
    .with({ disabled: true }, () => new ReviewDisabledError(reviewsId))
    .with({ userId }, () =>
      reviewsRepo.update(reviewsId, { content, updateUserId: userId }),
    )
    .otherwise(() => new ReviewForbiddenAccessError({ userId, reviewsId }));
};

type ToggleReviewArgs = { reviewsId: number; userId: number };
export const toggleReviewVisibility = async ({
  reviewsId,
  userId,
}: ToggleReviewArgs) => {
  const review = await findDisabledReviewById({ id: reviewsId });

  return match(review)
    .with(null, () => new ReviewNotFoundError(reviewsId))
    .otherwise(async ({ disabled }) =>
      toggleReviewVisibilityById({ reviewsId, userId, disabled }),
    );
};
