import { DOMAIN_URL } from '../../utils/error/errorCode';
import * as bookInfoReviewsRepository from '../repository/bookInfoReviews.repository';

export const getPageNoOffset = async (bookInfoId: number, reviewsId: number, sort: 'asc' | 'desc') => {
  const items = await bookInfoReviewsRepository
    .getBookinfoReviewsPageNoOffset(bookInfoId, reviewsId, sort);
  const counts = await bookInfoReviewsRepository
    .getBookInfoReviewsCounts(bookInfoId, reviewsId, sort);
  const finalReviewsId = items[items.length - 1]?.reviewsId;
  // 추후에 DOMAIN_URL을 환경변수로 대체합니다.
  const next = (counts <= 10) ? undefined : `${DOMAIN_URL}/api/book-info/${bookInfoId}/reviews/reviewsId=${finalReviewsId}`;
  const meta = {
    totalLeftItems: counts,
    itemsPerPage: 10,
    totalLeftPages: parseInt(String(counts / 10), 10),
    next
  };
  return { items, meta };
};
