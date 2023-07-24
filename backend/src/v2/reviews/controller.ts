/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import type { AppRouteOptions } from '@ts-rest/express';
import { contract } from '@jiphyeonjeon-42/contracts';

import { P, match } from 'ts-pattern';

import {
  ReviewsService,
  ReviewNotFoundError,
  ReviewForbiddenAccessError,
  ReviewDisabledError,
} from './service';
import {
  bookInfoNotFound,
  getUser,
  BookInfoNotFoundError,
  reviewNotFound,
  HandlerFor,
} from '../shared';
import { UpdateResult } from 'typeorm';

type PostDeps = Pick<ReviewsService, 'createReviews'>;
type MkPost = (deps: PostDeps) => HandlerFor<typeof contract.reviews.post>;
export const mkPostReviews: MkPost =
  ({ createReviews }) =>
  async ({ query: { bookInfoId }, body: { content }, req: { user } }) => {
    const { id: userId } = getUser.parse(user);
    const result = await createReviews({ bookInfoId, userId, content });

    return match(result)
      .with(P.instanceOf(BookInfoNotFoundError), () => bookInfoNotFound)
      .otherwise(() => ({ status: 201, body: '리뷰가 작성되었습니다.' } as const));
  };

type PatchDeps = Pick<ReviewsService, 'patchReviews'>;
type MkPatch = (deps: PatchDeps) => HandlerFor<typeof contract.reviews.patch>;
export const mkPatchReviews: MkPatch =
  ({ patchReviews }) =>
  async ({ params: { reviewsId }, req: { user } }) => {
    const { id: userId } = getUser.parse(user);
    const result = await patchReviews({ reviewsId, userId });

    return match(result)
      .with(P.instanceOf(ReviewNotFoundError), () => reviewNotFound)
      .otherwise(() => ({ status: 200, body: '리뷰 공개 여부가 업데이트되었습니다.' } as const));
  };

type PutDeps = Pick<ReviewsService, 'updateReviews'>;
type MkPut = (deps: PutDeps) => HandlerFor<typeof contract.reviews.put>;
export const mkPutReviews: MkPut =
  ({ updateReviews }) =>
  async ({ params: { reviewsId }, body: { content }, req: { user } }) => {
    const { id: userId } = getUser.parse(user);
    const result = await updateReviews({ reviewsId, userId, content });

    return match(result)
      .with(
        P.instanceOf(UpdateResult),
        () => ({ status: 200, body: '리뷰가 수정되었습니다.' } as const),
      )
      .otherwise(() => reviewNotFound);
  };

type DeleteDeps = Pick<ReviewsService, 'deleteReviews'>;
type MkDelete = (deps: DeleteDeps) => HandlerFor<typeof contract.reviews.delete>;
export const mkDeleteReviews: MkDelete =
  ({ deleteReviews }) =>
  async ({ params: { reviewsId }, req: { user } }) => {
    const deleter = getUser.parse(user);
    const result = await deleteReviews({ reviewsId, deleter });

    return (
      match(result)
        .with(
          P.instanceOf(UpdateResult),
          () => ({ status: 200, body: '리뷰가 삭제되었습니다.' } as const),
        )
        // TODO: 403
        .otherwise(() => reviewNotFound)
    );
  };
