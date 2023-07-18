/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { initServer } from '@ts-rest/express';
import { contract } from '@jiphyeonjeon-42/contracts';
import { z } from 'zod';

import authValidate from '~/v1/auth/auth.validate';
import { roleSet } from '~/v1/auth/auth.type';
import { positiveInt } from '~/v1/reviews/controller/reviews.type';

import jipDataSource from '~/app-data-source';
import Reviews from '~/entity/entities/Reviews';

import { P, match } from 'ts-pattern';

import ReviewsService, { ReviewNotFoundError } from './service';

const service = new ReviewsService(jipDataSource.getRepository(Reviews));

const s = initServer();

const getUser = z.object({ id: positiveInt });

/** TODO: 컨트롤러를 클래스 또는 service를 인자로 받는 함수로 전환 */
export const reviews = s.router(contract.reviews, {
  post: async () => ({ status: 201, body: '리뷰가 작성되었습니다.' }),
  put: async () => ({ status: 200, body: '리뷰가 수정되었습니다.' }),
  patch: {
    middleware: [authValidate(roleSet.librarian)],

    handler: async ({ params: { reviewsId }, req: { user } }) => {
      const { id: userId } = getUser.parse(user);

      const result = await service.patchReviews({ reviewsId, userId });
      return match(result)
        .with(P.instanceOf(ReviewNotFoundError), () => ({ status: 404, body: { code: 'REVIEWS_NOT_FOUND', message: '검색한 리뷰가 존재하지 않습니다.' } }) as const)
        .otherwise(() => ({ status: 200, body: '리뷰 공개 여부가 업데이트되었습니다.' }) as const);
    },
  },
});
