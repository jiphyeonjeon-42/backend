import jipDataSource from '~/app-data-source';
import Reviews from '~/entity/entities/Reviews';
import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer, type AppRouteImplementation, AppRouteOptions } from '@ts-rest/express';
import { match, P } from 'ts-pattern';
import { roleSet } from '~/v1/auth/auth.type';
import authValidate from '~/v1/auth/auth.validate';
import ReviewsServiceClass, {
  ReviewsService,
  ReviewNotFoundError,
  mkCreateReviews,
} from './service';
import { mkPostReviews } from './controller';
import { getUser, reviewNotFound } from '../shared';

export const service = new ReviewsServiceClass(jipDataSource.getRepository(Reviews));

// DI 과정

// 서비스에 TypeormRepository::reviews 주입
export const createReviews: ReviewsService['createReviews'] = mkCreateReviews({
  reviews: jipDataSource.getRepository(Reviews),
});

// post에 Service::createReviews 주입
export const postHandler = mkPostReviews({ createReviews });

// post를 라우터에 주입
const s = initServer();

/** TODO: 컨트롤러를 클래스 또는 service를 인자로 받는 함수로 전환 */
export const reviews = s.router(contract.reviews, {
  post: {
    middleware: [authValidate(roleSet.all)],
    handler: postHandler,
  },
  put: async () => ({ status: 200, body: '리뷰가 수정되었습니다.' }),
  patch: {
    middleware: [authValidate(roleSet.librarian)],

    handler: async ({ params: { reviewsId }, req: { user } }) => {
      const { id: userId } = getUser.parse(user);

      const result = await service.patchReviews({ reviewsId, userId });
      return match(result)
        .with(P.instanceOf(ReviewNotFoundError), () => reviewNotFound)
        .otherwise(
          () =>
            ({
              status: 200,
              body: '리뷰 공개 여부가 업데이트되었습니다.',
            } as const),
        );
    },
  } satisfies AppRouteOptions<typeof contract.reviews.patch>,
});
