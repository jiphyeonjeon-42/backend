import { Repository } from 'typeorm';
import type BookInfo from '~/entity/entities/BookInfo';
import type Reviews from '~/entity/entities/Reviews';
import {
  mkCreateReview,
  mkRemoveReview,
  mkToggleReviewVisibility,
  mkUpdateReview,
} from './service';

export const implReviewService = (repos: {
  reviews: Repository<Reviews>;
  bookInfo: Repository<BookInfo>;
}) => ({
  createReview: mkCreateReview(repos),
  removeReview: mkRemoveReview(repos),
  updateReview: mkUpdateReview(repos),
  toggleReviewVisibility: mkToggleReviewVisibility(repos),
});
