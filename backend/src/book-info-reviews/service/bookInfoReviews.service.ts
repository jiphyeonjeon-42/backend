import { DOMAIN_URL } from '../../utils/env_temp';
import * as bookInfoReviewsRepository from '../repository/bookInfoReviews.repository';

export const getPageNoOffset = async (bookInfoId: number, reviewsId: number, sort: 'asc' | 'desc', limit: number) => {
  const items = await bookInfoReviewsRepository
    .getBookinfoReviewsPageNoOffset(bookInfoId, reviewsId, sort, limit);
  const counts = await bookInfoReviewsRepository
    .getBookInfoReviewsCounts(bookInfoId, reviewsId, sort);
  const itemsPerPage = (Number.isNaN(limit)) ? 10 : limit;
  const finalReviewsId = items[items.length - 1]?.reviewsId;
  // 추후에 DOMAIN_URL을 환경변수로 대체합니다.
  const next = (counts <= itemsPerPage) ? undefined : `${DOMAIN_URL}/api/book-info/${bookInfoId}/reviews/reviewsId=${finalReviewsId}`;
  const meta = {
    totalLeftItems: counts,
    itemsPerPage,
    totalLeftPages: parseInt(String(counts / itemsPerPage), 10),
    next
  };
  return { items, meta };
};
