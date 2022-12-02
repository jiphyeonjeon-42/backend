import * as errorCode from '../../utils/error/errorCode';
import { executeQuery, makeExecuteQuery, pool } from '../../mysql';

export const createReviews = async (userId: number, bookInfoId: number, content: string) => {
  const numberOfBookInfo = await executeQuery(`
    SELECT COUNT(*) as count
    FROM book_info
    WHERE id = ?;
  `, [bookInfoId]);
  if (numberOfBookInfo[0].count === 0) {throw new Error(errorCode.INVALID_INPUT_REVIEWS); }
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  conn.beginTransaction();
  try {
    await transactionExecuteQuery(`
      INSERT INTO reviews(
        userId,
        bookInfoId,
        updateUserId,
        isDeleted,
        content
      )VALUES (?, ?, ?, ?, ?)
    `, [userId, bookInfoId, userId, false, content]);
    conn.commit();
  } catch (error) {
    conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const getReviewsPage = async (
  bookInfoId: number,
  userId: number,
  page: number,
  sort: 'asc' | 'desc',
  title :string,
  intraId: string,
  disabled: boolean,
) => {
  const bookInfoIdQuery = (Number.isNaN(bookInfoId)) ? '' : `AND reviews.bookInfoId = ${bookInfoId}`;
  const userIdQuery = (Number.isNaN(userId)) ? '' : `AND reviews.userId = ${userId}`;
  const titleQuery = title === '' ? '' : `AND book_info.title = "${title}"`;
  const intraIdQuery = intraId === '' ? '' : `AND user.intraId = "${intraId}"`;
  const disabledQuery = !disabled ? '' : `AND reviews.disabled = ${disabled}`;
  const sortQuery = `ORDER BY reviews.id ${sort}`;

  const reviews = await executeQuery(`
  SELECT
    reviews.id as reviewsId,
    reviews.userId as reviewerId,
    reviews.bookInfoId,
    reviews.content,
    reviews.createdAt,
    reviews.disabled,
    book_info.title,
    user.nickname,
    user.intraId
  FROM reviews
  JOIN user ON user.id = reviews.userId
  JOIN book_info ON reviews.bookInfoId = book_info.id  
  WHERE reviews.isDeleted = false
    ${bookInfoIdQuery}
    ${userIdQuery}
    ${titleQuery}
    ${intraIdQuery}
    ${disabledQuery}
    ${sortQuery}
  LIMIT 10 
  OFFSET ?
  `, [page * 10]);
  return (reviews);
};

export const getReviewsCounts = async (bookInfoId: number, userId: number, title :string, intraId: string, disabled: boolean) => {
  const bookInfoIdQuery = (Number.isNaN(bookInfoId)) ? '' : `AND reviews.bookInfoId = ${bookInfoId}`;
  const userIdQuery = (Number.isNaN(userId)) ? '' : `AND reviews.userId = ${userId}`;
  const titleQuery = title === '' ? '' : `AND book_info.title = "${title}"`;
  const intraIdQuery = intraId === '' ? '' : `AND user.intraId = "${intraId}"`;
  const disabledQuery = !disabled ? '' : `AND reviews.disabled = ${disabled}`;  const counts = await executeQuery(`
  SELECT
    COUNT(*) as counts
  FROM reviews
  JOIN user ON user.id = reviews.userId
  JOIN book_info ON reviews.bookInfoId = book_info.id  
  WHERE reviews.isDeleted = false
    ${bookInfoIdQuery}
    ${userIdQuery}
    ${titleQuery}
    ${intraIdQuery}
    ${disabledQuery}
  `);
  return (counts[0].counts);
};

export const getReviewsUserId = async (
  reviewsId : number,
) => {
  const reviewsUserId = await executeQuery(`
    SELECT
      userId
    FROM reviews
    WHERE id = ? 
    AND isDeleted = false
    `, [reviewsId]);
  return reviewsUserId[0].userId;
};

export const getReviews = async (
  reviewsId : number,
) => {
  const result: any = await executeQuery(`
    SELECT
      userId,
      disabled
    FROM reviews
    WHERE id = ? 
    AND isDeleted = false
    `, [reviewsId]);
  return result;
};

export const updateReviews = async (
  reviewsId : number,
  userId : number,
  content : string,
) => {
  await executeQuery(`
    UPDATE reviews
    SET
      content = ?,
      updateUserId = ?
    WHERE id = ?
    `, [content, userId, reviewsId]);
};

export const deleteReviews = async (reviewId: number, deleteUser: number) => {
  await executeQuery(`
      UPDATE reviews
      SET
        isDeleted = ?,
        deleteUserId = ?
      WHERE id = ?
    `, [true, deleteUser, reviewId]);
};

export const patchReviews = async (
  reviewsId : number,
  userId : number,
) => {
  await executeQuery(`
    UPDATE reviews
    SET
      disabled = IF(disabled=TRUE, FALSE, TRUE),
      disabledUserId = IF(disabled=FALSE, NULL, ?)
    WHERE id = ?
    `, [userId, reviewsId]);
};
