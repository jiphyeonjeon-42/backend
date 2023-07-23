import jipDataSource from '~/app-data-source';
import Reviews from '~/entity/entities/Reviews';
import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import { roleSet } from '~/v1/auth/auth.type';
import authValidate from '~/v1/auth/auth.validate';
import {
  mkCreateReviews,
  mkDeleteReviews as mkHideReviews,
  mkUpdateReviews,
  mkPatchReviews as mkToggleReviews,
} from './service';
import { mkPostReviews, mkPatchReviews, mkPutReviews, mkDeleteReviews } from './controller';
import BookInfo from '~/entity/entities/BookInfo';

// DI 과정
const bookInfoRepo = jipDataSource.getRepository(BookInfo);
const reviewsRepo = jipDataSource.getRepository(Reviews);
const reviewsDeps = { reviews: reviewsRepo };

// 서비스에 TypeormRepository::reviews 주입
const createReviews = mkCreateReviews({ ...reviewsDeps, bookInfo: bookInfoRepo });
const deleteReviews = mkHideReviews(reviewsDeps);
const updateReviews = mkUpdateReviews(reviewsDeps);
const patchReviews = mkToggleReviews(reviewsDeps);

// post에 Service::createReviews 주입
const postHandler = mkPostReviews({ createReviews });
const patchHandler = mkPatchReviews({ patchReviews });
const putHandler = mkPutReviews({ updateReviews });
const deleteHander = mkDeleteReviews({ deleteReviews });

// post를 라우터에 주입
const s = initServer();

/** TODO: 컨트롤러를 클래스 또는 service를 인자로 받는 함수로 전환 */
export const reviews = s.router(contract.reviews, {
  post: {
    middleware: [authValidate(roleSet.all)],
    handler: postHandler,
  },
  put: {
    middleware: [authValidate(roleSet.all)],
    handler: putHandler,
  },
  patch: {
    middleware: [authValidate(roleSet.librarian)],
    handler: patchHandler,
  },
  delete: {
    middleware: [authValidate(roleSet.all)],
    handler: deleteHander,
  },
});
