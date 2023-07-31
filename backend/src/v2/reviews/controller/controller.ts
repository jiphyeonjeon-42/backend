import { contract } from '@jiphyeonjeon-42/contracts';
import { P, match } from 'ts-pattern';
import { UpdateResult } from 'typeorm';
import {
  BookInfoNotFoundError,
  HandlerFor,
  bookInfoNotFound,
  getUser,
  reviewNotFound,
} from '../../shared';
import { ReviewsService } from '../service';
import { ReviewNotFoundError } from '../service/errors';

type PostDeps = Pick<ReviewsService, 'createReview'>;
type MkPost = (services: PostDeps) => HandlerFor<typeof contract.reviews.post>;
export const mkPostReviews: MkPost =
  ({ createReview }) =>
  async ({ query: { bookInfoId }, body: { content }, req: { user } }) => {
    const { id: userId } = getUser.parse(user);
    const result = await createReview({ bookInfoId, userId, content });

    return match(result)
      .with(P.instanceOf(BookInfoNotFoundError), () => bookInfoNotFound)
      .otherwise(
        () => ({ status: 201, body: '리뷰가 작성되었습니다.' } as const),
      );
  };

type PatchDeps = Pick<ReviewsService, 'toggleReviewVisibility'>;
type MkPatch = (
  services: PatchDeps,
) => HandlerFor<typeof contract.reviews.patch>;
export const mkPatchReviews: MkPatch =
  ({ toggleReviewVisibility }) =>
  async ({ params: { reviewsId }, req: { user } }) => {
    const { id: userId } = getUser.parse(user);
    const result = await toggleReviewVisibility({ reviewsId, userId });

    return match(result)
      .with(P.instanceOf(ReviewNotFoundError), () => reviewNotFound)
      .otherwise(
        () =>
          ({
            status: 200,
            body: '리뷰 공개 여부가 업데이트되었습니다.',
          } as const),
      );
  };

type PutDeps = Pick<ReviewsService, 'updateReview'>;
type MkPut = (services: PutDeps) => HandlerFor<typeof contract.reviews.put>;
export const mkPutReviews: MkPut =
  ({ updateReview }) =>
  async ({ params: { reviewsId }, body: { content }, req: { user } }) => {
    const { id: userId } = getUser.parse(user);
    const result = await updateReview({ reviewsId, userId, content });

    return match(result)
      .with(
        P.instanceOf(UpdateResult),
        () => ({ status: 200, body: '리뷰가 수정되었습니다.' } as const),
      )
      .otherwise(() => reviewNotFound);
  };

type DeleteDeps = Pick<ReviewsService, 'removeReview'>;
type MkDelete = (
  services: DeleteDeps,
) => HandlerFor<typeof contract.reviews.delete>;
export const mkDeleteReviews: MkDelete =
  ({ removeReview }) =>
  async ({ params: { reviewsId }, req: { user } }) => {
    const deleter = getUser.parse(user);
    const result = await removeReview({ reviewsId, deleter });

    return match(result)
      .with(
        P.instanceOf(UpdateResult),
        () => ({ status: 200, body: '리뷰가 삭제되었습니다.' } as const),
      )
      .otherwise(() => reviewNotFound);
  };
