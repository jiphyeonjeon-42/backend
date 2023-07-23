/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import type { AppRouteOptions } from '@ts-rest/express';
import { contract } from '@jiphyeonjeon-42/contracts';

import { P, match } from 'ts-pattern';

import { ReviewsService, ReviewNotFoundError } from './service';
import { bookInfoNotFound, getUser, BookInfoNotFoundError, reviewNotFound } from '../shared';

type PostReviewsDeps = Pick<ReviewsService, 'createReviews'>;
type PostReviewsHandler = AppRouteOptions<typeof contract.reviews.post>['handler'];
type MkPostReviews = (deps: PostReviewsDeps) => PostReviewsHandler;
export const mkPostReviews: MkPostReviews =
  ({ createReviews }): PostReviewsHandler =>
  async ({ query: { bookInfoId }, body: { content }, req: { user } }) => {
    const { id: userId } = getUser.parse(user);
    const result = await createReviews({ bookInfoId, userId, content });

    return match(result)
      .with(P.instanceOf(BookInfoNotFoundError), () => bookInfoNotFound)
      .otherwise(() => ({ status: 201, body: '리뷰가 작성되었습니다.' } as const));
  };

type PatchReviewsDeps = Pick<ReviewsService, 'patchReviews'>;
type PatchReviewsHandler = AppRouteOptions<typeof contract.reviews.patch>['handler'];
type MkPatchReviews = (deps: PatchReviewsDeps) => PatchReviewsHandler;
export const mkPatchReviews: MkPatchReviews =
  ({ patchReviews }): PatchReviewsHandler =>
  async ({ params: { reviewsId }, req: { user } }) => {
    const { id: userId } = getUser.parse(user);
    const result = await patchReviews({ reviewsId, userId });

    return match(result)
      .with(P.instanceOf(ReviewNotFoundError), () => reviewNotFound)
      .otherwise(() => ({ status: 200, body: '리뷰 공개 여부가 업데이트되었습니다.' } as const));
  };

type PutReviewsDeps = Pick<ReviewsService, 'updateReviews'>;
type PutReviewsHandler = AppRouteOptions<typeof contract.reviews.put>['handler'];
type MkPutReviews = (deps: PutReviewsDeps) => PutReviewsHandler;
export const mkPutReviews: MkPutReviews =
  ({ updateReviews }) =>
  async ({ params: { reviewsId }, body: { content }, req: { user } }) => {
    const { id: userId } = getUser.parse(user);
    const result = await updateReviews({ reviewsId, userId, content });

    return match(result)
      .with(P.instanceOf(ReviewNotFoundError), () => reviewNotFound)
      .otherwise(() => ({ status: 200, body: '리뷰가 수정되었습니다.' } as const));
  };

type DeleteReviewsDeps = Pick<ReviewsService, 'deleteReviews'>;
type DeleteReviewsHandler = AppRouteOptions<typeof contract.reviews.delete>['handler'];
type MkDeleteReviews = (deps: DeleteReviewsDeps) => DeleteReviewsHandler;
export const mkDeleteReviews: MkDeleteReviews =
  ({ deleteReviews }) =>
  async ({ params: { reviewsId }, req: { user } }) => {
    const { id: deleteUserId, role } = getUser.passthrough().parse(user);


    const result = await deleteReviews({ reviewsId, deleteUserId });

    return match(result)
      .with(P.instanceOf(ReviewNotFoundError), () => reviewNotFound)
      .otherwise(() => ({ status: 200, body: '리뷰가 삭제되었습니다.' } as const));
  };
