import { executeQuery } from '../../mysql';

export const getBookinfoReviewsPageNoOffset = async (bookInfoId: number, reviewsId: number, sort: 'asc' | 'desc', limit: number) => {
  const bookInfoIdQuery = (Number.isNaN(bookInfoId)) ? '' : `AND reviews.bookInfoId = ${bookInfoId}`;
  const sign = sort === 'asc' ? '>' : '<';
  const reviewIdQuery = (Number.isNaN(reviewsId)) ? '' : `AND reviews.id ${sign} ${reviewsId}`;
  const sortQuery = `ORDER BY reviews.id ${sort}`;
  if (bookInfoIdQuery === '') { return []; }
  const limitQuery = (Number.isNaN(limit)) ? 'LIMIT 10' : `LIMIT ${limit}`;

  const reviews = await executeQuery(`
  SELECT
    reviews.id as reviewsId,
    reviews.userId as reviewerId,
    reviews.bookInfoId,
    reviews.content,
    reviews.createdAt,
    book_info.title,
    user.nickname
  FROM reviews
  JOIN user ON user.id = reviews.userId
  JOIN book_info ON reviews.bookInfoId = book_info.id
  WHERE reviews.isDeleted = false
  AND reviews.disabled = false
    ${bookInfoIdQuery}
    ${reviewIdQuery}
    ${sortQuery}
  ${limitQuery}
  `);
  return (reviews);
};

export const getBookInfoReviewsCounts = async (bookInfoId: number, reviewsId: number, sort: 'asc' | 'desc') => {
  const bookInfoIdQuery = (Number.isNaN(bookInfoId)) ? '' : `AND reviews.bookInfoId = ${bookInfoId}`;
  const sign = sort === 'asc' ? '>' : '<';
  const reviewIdQuery = (Number.isNaN(reviewsId)) ? '' : `AND reviews.id ${sign} ${reviewsId}`;
  const counts = await executeQuery(`
  SELECT
    COUNT(*) as counts
  FROM reviews
  WHERE reviews.isDeleted = false
  AND reviews.disabled = false
    ${bookInfoIdQuery}
    ${reviewIdQuery}
  `);
  return (counts[0].counts);
};
