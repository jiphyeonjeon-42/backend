import * as errorCode from '../utils/error/errorCode';
import { executeQuery, makeExecuteQuery, pool } from '../mysql';
import { Meta } from '../users/users.type';

export const createReviews = async (userId: number, bookInfoId: number, commentText: string) => {
  console.log('create review');
  console.log(`${userId} ${bookInfoId} ${commentText}`);

  // for debug
  if (userId === undefined)
    userId = 1;

  // DB 사용 초기화
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);

  // bookInfoId가 유효한지 확인
  const numberOfBookInfo = await executeQuery(`
    SELECT COUNT(*) as count
    FROM book_info
    WHERE id = ?;
  `, [bookInfoId]);
  if (numberOfBookInfo[0].count === 0)
    throw new Error(errorCode.INVALID_INPUT_REVIEWS);

  // ???
  conn.beginTransaction();

  try {
    await transactionExecuteQuery(`
      INSERT INTO reviews(
        userId,
        bookInfoId,
        updatedUserId,
        isDelete,
        content
      )VALUES (?, ?, ?, ?, ?)
    `, [userId, bookInfoId, userId, false, commentText]);
    conn.commit();
  } catch (error) {
    conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const getReviews = async (bookInfoId: number, userId: number, reviewId: number, sort: string) => {
  console.log('get review');
  console.log(`${bookInfoId}`, typeof(bookInfoId), `${userId}`, `${reviewId}`);

  // DB 사용 초기화
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);

  // 인자체크
  let bookInfoIdQuery = (isNaN(bookInfoId)) ? "" : `AND reviews.bookInfoId = ${bookInfoId}`;
  let userIdQueryQuery = (isNaN(userId)) ? "" : `AND reviews.userId = ${userId}`;
  let reviewIdQuery = (isNaN(reviewId)) ? "" : `AND reviews.id = ${reviewId}`;
  let sortQuery = (sort === undefined || (sort != "DESC" && sort != "ASC")) ? "" : `ORDER BY reviews.createdAt ${sort}`;
  conn.beginTransaction();

  let reviews;

  reviews = await executeQuery(`
  SELECT
    reviews.id,
    reviews.userId,
    reviews.bookInfoId,
    user.nickname,
    reviews.content
  FROM reviews
  JOIN user ON user.id = reviews.userId
  WHERE reviews.isDelete = false
    ${bookInfoIdQuery}
    ${userIdQueryQuery}
    ${reviewIdQuery}
    ${sortQuery}
  `);

  return (reviews);
};

export const updateReviews= async () => {
  console.log('update reviews');
};

export const deleteReviews = async (reviewId: number, deleteUser: number) => {
  console.log('deleteReview');
  console.log(`${reviewId} should be soft deleted`);

  // debug
  if (deleteUser === undefined)
    deleteUser = 1;

  // DB 사용 초기화
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);

  // reviewId 유효 체크 + 삭제 권한 체크
  const numberOfReview = await executeQuery(`
    SELECT id
    FROM reviews
    WHERE id = ?;
  `, [reviewId]);
  if (numberOfReview.length === 0)
    throw new Error(errorCode.NOT_FOUND_REVIEWS);
  // else if (numberOfReview[0].id != deleteUser /*&& !is_librarian(deleteUser) */)
  //   throw new Error(errorCode.UNAUTHORIZED_REVIEWS);

  conn.beginTransaction();

  try {
    await transactionExecuteQuery(`
      UPDATE reviews
      SET
        isDeleted = ?,
        deleteUserId = ?
      WHERE id = ?
    `, [true, deleteUser, reviewId]);
    conn.commit();
  } catch (error) {
    conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
