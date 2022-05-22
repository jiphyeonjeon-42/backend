import { makeExecuteQuery, pool } from '../mysql';
// search할때 사용하는 sql문들

export const lendingOverload = '2권 이상 대출';
export const lendingOverdue = '연체 중';
export const onLending = '대출중';
export const onReservation = '예약된 책';
export const lostBook = '분실';
export const damagedBook = '파손';
export const ok = 'ok';
export const nonexistentLending = '존재하지 않는 대출';
export const alreadyReturned = '이미 반납 처리된 대출';

export const create = async (
  userId: number,
  bookId: number,
  librarianId: number,
  condition: string,
): Promise<string> => {
  let message = ok;
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  try {
    await conn.beginTransaction();

    // 유저가 2권 이상 대출
    const numberOfLendings = await transactionExecuteQuery(`
      SELECT COUNT(*)
      FROM lending
      WHERE userId = ? AND returnedAt IS NULL;
    `, [userId]);
    if (numberOfLendings[0].count >= 2) { throw new Error(lendingOverload); }

    // 유저가 연체중
    const hasPenalty = await transactionExecuteQuery(`
      SELECT penaltyEndDay
      FROM user
      WHERE id = ?
    `, [userId]);
    if (hasPenalty[0].penaltyEndDay > 0) { throw new Error(lendingOverdue); }

    // 책이 대출되지 않은 상태인지
    const isNotLended = await transactionExecuteQuery(`
      SELECT *
      FROM lending
      WHERE bookId = ? AND returnedAt IS NULL
    `, [bookId]);
    if (isNotLended[0].length !== 0) { throw new Error(onLending); }

    // 책이 분실, 파손이 아닌지
    const isLendableBook = await transactionExecuteQuery(`
     SELECT *
     FROM book
     WHERE id = ? AND status = 0
    `, [bookId]);
    if (isLendableBook[0].status === 1) {
      throw new Error(damagedBook);
    } else if (isLendableBook[0].status === 2) {
      throw new Error(lostBook);
    }

    // 예약된 책이 아닌지
    const isNotReservedBook = await transactionExecuteQuery(`
      SELECT *
      FROM reservation
      WHERE bookId = ? AND status = 0
    `, [bookId]);
    if (isNotReservedBook[0].userId !== userId) { throw new Error(onReservation); }

    await transactionExecuteQuery(`
      INSERT INTO lending (userId, bookId, lendingLibrarianId, lendingCondition)
      VALUES (?, ?, ?, ?)
    `, [userId, bookId, librarianId, condition]);

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    if (e instanceof Error) {
      message = e.message;
    }
  } finally {
    conn.release();
  }
  return message;
};

export const search = async () => {};

export const returnBook = async (
  librarianId: number,
  lendingId: number,
  condition: string,
): Promise<string> => {
  let message = ok;
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  try {
    await conn.beginTransaction();

    // 유효한 lendingId 인지, 반납처리가 이미 된 책인지 확인
    const lendingInfo = await transactionExecuteQuery(`
      SELECT *
      FROM lending
      WHERE id = ?;
    `, [lendingId]);
    if (!lendingInfo || !lendingInfo[0]) {
      throw new Error(nonexistentLending);
    } else if (lendingInfo[0].returnedAt) {
      throw new Error(alreadyReturned);
    }

    await transactionExecuteQuery(`
      UPDATE lending
      SET returningLibrarian = ?,
          returningCondition = ?
      WHERE id = ?
    `, [librarianId, lendingId, condition]);

    // 예약된 책이 있다면 예약 부여, endAt 어떻게 처리하지..?
    const isReserved = await transactionExecuteQuery(`
      SELECT *
      FROM reservation
      WHERE bookInfoId = (
        SELECT infoId
        FROM book
        WHERE id = ?
      ) AND status = 0 AND bookId IS NULL
      ORDER BY createdAt
      LIMIT 1;
    `, [lendingInfo[0].bookId]);
    if (isReserved && isReserved[0]) {
      await transactionExecuteQuery(`
        UPDATE reservation
        SET bookId = ?
        WHERE id = ?
    `, [lendingInfo[0].bookId, isReserved[0].id]);
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    if (e instanceof Error) {
      message = e.message;
    }
  } finally {
    conn.release();
  }
  return message;
};
