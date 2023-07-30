import { Repository } from 'typeorm';
import {
  mkCreateReview,
  mkRemoveReview,
  mkToggleReviewVisibility,
  mkUpdateReview,
} from './service';
import type { Reviews, BookInfo } from '~/entity/entities';

export const implReviewService = (repos: {
  reviews: Repository<Reviews>;
  bookInfo: Repository<BookInfo>;
}) => ({
  createReview: mkCreateReview(repos),
  removeReview: mkRemoveReview(repos),
  updateReview: mkUpdateReview(repos),
  toggleReviewVisibility: mkToggleReviewVisibility(repos),
});
