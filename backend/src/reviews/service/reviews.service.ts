import * as errorCheck from './utils/errorCheck';
import ReviewsRepository from '../repository/reviews.repository';

export default class ReviewsService {
  private readonly reviewsRepository : ReviewsRepository;

  constructor() {
    this.reviewsRepository = new ReviewsRepository();
  }

  async createReviews(userId: number, bookInfoId: number, content: string) {
    await this.reviewsRepository.validateBookInfo(bookInfoId);
    await this.reviewsRepository.createReviews(userId, bookInfoId, content);
  }

  async getReviewsPage(
    reviewerId: number,
    isMyReview: boolean,
    titleOrNickname: string,
    disabled: number,
    page: number,
    sort: 'ASC' | 'DESC',
    limit: number,
  ) {
    const items = await this.reviewsRepository.getReviewsPage(
      reviewerId,
      isMyReview,
      titleOrNickname,
      disabled,
      page,
      sort,
      limit,
    );
    const counts = await this.reviewsRepository.getReviewsCounts(
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
  }

  async getReviewsUserId(
    reviewsId: number,
  ) {
    const reviewsUserId = await this.reviewsRepository.getReviewsUserId(reviewsId);
    return reviewsUserId;
  }

  async updateReviews(
    reviewsId: number,
    userId: number,
    content: string,
  ) {
    const reviewsUserId = await errorCheck.updatePossibleCheck(reviewsId);
    errorCheck.idAndTokenIdSameCheck(reviewsUserId, userId);
    await this.reviewsRepository.updateReviews(reviewsId, userId, content);
  }

  async deleteReviews(reviewId: number, deleteUser: number) {
    await this.reviewsRepository.deleteReviews(reviewId, deleteUser);
  }

  async patchReviews(
    reviewsId: number,
    userId: number,
  ) {
    await this.reviewsRepository.patchReviews(reviewsId, userId);
  }
}
