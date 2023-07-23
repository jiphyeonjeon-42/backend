/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import type { AppRouteOptions } from '@ts-rest/express';
import { contract } from '@jiphyeonjeon-42/contracts';

import { P, match } from 'ts-pattern';

import { ReviewsService } from './service';
import { BookInfoNotFoundError } from '../shared';
import { bookInfoNotFound, getUser } from '../shared';

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

