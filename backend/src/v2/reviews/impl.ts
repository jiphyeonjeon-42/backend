import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import jipDataSource from '~/app-data-source';
import BookInfo from '~/entity/entities/BookInfo';
import Reviews from '~/entity/entities/Reviews';
import { roleSet } from '~/v1/auth/auth.type';
import authValidate from '~/v1/auth/auth.validate';

import { Repository } from 'typeorm';
import { mkDeleteReviews, mkPatchReviews, mkPostReviews, mkPutReviews } from './controller';
import {
  ReviewsService as ReviewService,
  mkCreateReview,
  mkRemoveReview,
  mkToggleReviewVisibility,
  mkUpdateReview,
} from './service';

const implReviewService = (repos: {
  reviews: Repository<Reviews>;
  bookInfo: Repository<BookInfo>;
}) => ({
  createReview: mkCreateReview(repos),
  removeReview: mkRemoveReview(repos),
  updateReview: mkUpdateReview(repos),
  toggleReviewVisibility: mkToggleReviewVisibility(repos),
});

const implReviewController = (service: ReviewService) => ({
  post: mkPostReviews(service),
  patch: mkPatchReviews(service),
  put: mkPutReviews(service),
  delete: mkDeleteReviews(service),
});

const service = implReviewService({
  reviews: jipDataSource.getRepository(Reviews),
  bookInfo: jipDataSource.getRepository(BookInfo),
});

const handler = implReviewController(service);

const s = initServer();
export const reviews = s.router(contract.reviews, {
  post: {
    middleware: [authValidate(roleSet.all)],
    handler: handler.post,
  },
  put: {
    middleware: [authValidate(roleSet.all)],
    handler: handler.put,
  },
  patch: {
    middleware: [authValidate(roleSet.librarian)],
    handler: handler.patch,
  },
  delete: {
    middleware: [authValidate(roleSet.all)],
    handler: handler.delete,
  },
});
