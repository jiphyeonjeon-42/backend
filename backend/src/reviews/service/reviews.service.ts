import * as reviewsRepository from '../repository/reviews.repository';
import * as errorCheck from './utils/errorCheck';

export const createReviews = async (userId: number, bookInfoId: number, content: string) => {
  await reviewsRepository.createReviews(userId, bookInfoId, content);
};

export const getReviewsPage = async (
  reviewerId: number,
  isMyReview: boolean,
  titleOrNickname: string,
  disabled: number,
  page: number,
  sort: 'asc' | 'desc',
  limit: number,
) => {
  const items = await reviewsRepository.getReviewsPage(
    reviewerId,
    isMyReview,
    titleOrNickname,
    disabled,
    page,
    sort,
    limit,
  );
  const counts = await reviewsRepository.getReviewsCounts(
    reviewerId,
    isMyReview,
    titleOrNickname,
    disabled,
  );
  const itemsPerPage = (Number.isNaN(limit)) ? 10 : limit;
  const meta = {
    totalItems: counts,
    itemsPerPage,
    totalPages: parseInt(String(counts / itemsPerPage + Number((counts % itemsPerPage != 0) || !counts)), 10),
    firstPage: page === 0,
    finalPage: page === parseInt(String(counts / itemsPerPage), 10),
    currentPage: page,
  };
  return { items, meta };
};

export const getReviewsUserId = async (
  reviewsId : number,
) => {
  const reviewsUserId = await reviewsRepository.getReviewsUserId(reviewsId);
  return reviewsUserId;
};

export const updateReviews = async (
  reviewsId : number,
  userId : number,
  content : string,
) => {
  const reviewsUserId = await errorCheck.updatePossibleCheck(reviewsId);
  errorCheck.idAndTokenIdSameCheck(reviewsUserId, userId);
  await reviewsRepository.updateReviews(reviewsId, userId, content);
};

export const deleteReviews = async (reviewId: number, deleteUser: number) => {
  await reviewsRepository.deleteReviews(reviewId, deleteUser);
};

export const patchReviews = async (
  reviewsId : number,
  userId : number,
) => {
  await reviewsRepository.patchReviews(reviewsId, userId);
};
