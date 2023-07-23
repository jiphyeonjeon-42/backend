import * as bookInfoReviewsRepository from '../repository/bookInfoReviews.repository';

export const getPageNoOffset = async (bookInfoId: number, reviewsId: number, sort: 'asc' | 'desc', limit: number) => {
  const items = await bookInfoReviewsRepository
    .getBookinfoReviewsPageNoOffset(bookInfoId, reviewsId, sort, limit);
  const counts = await bookInfoReviewsRepository
    .getBookInfoReviewsCounts(bookInfoId, reviewsId, sort);
  const itemsPerPage = (Number.isNaN(limit)) ? 10 : limit;
  const finalReviewsId = items[items.length - 1]?.reviewsId;
  const meta = {
    totalLeftItems: counts,
    itemsPerPage,
    totalLeftPages: parseInt(String(counts / itemsPerPage), 10),
    finalPage: counts <= itemsPerPage,
    finalReviewsId,
  };
  return { items, meta };
};
