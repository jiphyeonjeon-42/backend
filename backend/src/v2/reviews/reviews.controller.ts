/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { initServer } from '@ts-rest/express';
import { contract } from '@jiphyeonjeon-42/contracts';
import { z } from 'zod';
import authValidate from '../../v1/auth/auth.validate';
import { roleSet } from '../../v1/auth/auth.type';

import { positiveInt } from '../../v1/reviews/controller/reviews.type';

const s = initServer();

const getUser = z.object({ id: positiveInt });

export const reviewsControllerV2 = s.router(contract.reviews, {
  patch: {
    middleware: [authValidate(roleSet.librarian)],

    handler: async ({ params: { reviewsId }, req: { user } }) => {
      const { id } = getUser.parse(user);
      try {
        await reviewsService.getReviewsUserId(reviewsId);
      } catch {
        return { status: 404, body: { code: 'NOT_FOUND_REVIEWS', message: '검색한 리뷰가 존재하지 않습니다.' } };
      }
      await reviewsService.patchReviews(reviewsId, id);
      return { status: 200, body: '리뷰 공개 여부가 업데이트되었습니다.' };
    },
  },
});
