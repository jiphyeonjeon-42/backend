import * as bookInfoReviewsRepository from '../repository/bookInfoReviews.repository';

export const getPageNoOffset = async (bookInfoId: number, reviewsId: number, sort: 'asc' | 'desc') => {
  const items = await bookInfoReviewsRepository
    .getBookinfoReviewsPageNoOffset(bookInfoId, reviewsId, sort);
  const counts = await bookInfoReviewsRepository
    .getBookInfoReviewsCounts(bookInfoId, reviewsId, sort);
  const finalReviewsId = items[items.length - 1]?.reviewsId;
  const meta = {
    totalLeftItems: counts,
    itemsPerPage: 10,
    totalLeftPages: parseInt(String(counts / 10), 10),
    finalPage: counts <= 10,
    finalReviewsId: finalReviewsId === undefined ? -1 : finalReviewsId,
  };
  return { items, meta };
};
