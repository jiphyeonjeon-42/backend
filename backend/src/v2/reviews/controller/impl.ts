import { ReviewsService } from '../service';
import {
  mkDeleteReviews,
  mkPatchReviews,
  mkPostReviews,
  mkPutReviews,
} from './controller';

export const implReviewController = (service: ReviewsService) => ({
  post: mkPostReviews(service),
  patch: mkPatchReviews(service),
  put: mkPutReviews(service),
  delete: mkDeleteReviews(service),
});
