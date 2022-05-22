import { executeQuery, makeExecuteQuery, pool } from '../mysql';
import { paginate } from '../paginate';

export const ok = 'ok';

// constants for create
export const atPenalty = '대출 제한 중';
export const notLended = '대출 가능';
export const alreadyReserved = '이미 예약 중';
export const alreadyLended = '이미 대출 중';
export const moreThanTwoReservations = '두 개 이상 예약 중';

// constants for cancel
export const notMatchingUser = '해당 유저 아님';
export const reservationNotExist = '예약 ID 존재하지 않음';
export const notReserved = '예약 상태가 아님';

export const create = async (userId: number, bookInfoId: number) => {
  let message = ok;
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  try {
    // 연체중인지 확인
    const userPenalty = await transactionExecuteQuery(`
      SELECT penaltyEndDay
      FROM user
      WHERE id = ?;
    `, [userId]);
    if (userPenalty.penaltyEndDay > new Date()) {
      throw new Error(atPenalty);
    }
    // bookInfoId가 모두 대출중인지 확인
    const allBooks = await transactionExecuteQuery(`
      SELECT id
      FROM book
      WHERE infoId = ?;
    `, [bookInfoId]) as [{id: number}];
    const allLendings = await transactionExecuteQuery(`
      SELECT
        bookId,
        returnedAt
      FROM lending
      WHERE bookId = (
        SELECT id
        FROM book
        WHERE infoId = ?
      );
    `, [bookInfoId]) as [{bookId: number, returnedAt: Date}];
    const isLended: Set<number> = new Set<number>();
    Object.values(allLendings).forEach((lending) => {
      if (lending.returnedAt !== null) {
        isLended.add(lending.bookId);
      }
    });
    if (isLended.size !== allBooks.length) {
      throw new Error(notLended);
    }
    // 이미 대출한 bookInfoId가 아닌지 확인
    const lendedBook = await transactionExecuteQuery(`
      SELECT book.id
      FROM lending
      LEFT JOIN book ON book.id = lending.bookId
      WHERE
        lending.userId = ? AND
        lending.returnedAt = NULL AND
        book.infoId = ?
    `, [userId, bookInfoId]);
    if (lendedBook.length) {
      throw new Error(alreadyLended);
    }
    // 이미 예약한 bookInfoId가 아닌지 확인
    const reservedBook = await transactionExecuteQuery(`
      SELECT id
      FROM reservation
      WHERE bookInfoId = ? AND status = 0;
    `, [bookInfoId]);
    if (reservedBook.length) {
      throw new Error(alreadyReserved);
    }
    // 예약한 횟수가 2회 미만인지 확인
    const reserved = await transactionExecuteQuery(`
      SELECT id
      FROM reservation
      WHERE userId = ? AND status = 0;
    `, [userId]);
    if (reserved.length >= 2) {
      throw new Error(moreThanTwoReservations);
    }
    await transactionExecuteQuery(`
      INSERT INTO (userId, bookInfoId)
      VALUES (?, ?)
    `, [userId, bookInfoId]);
  } catch (e) {
    conn.rollback();
    if (e instanceof Error) {
      message = e.message;
    }
  } finally {
    conn.release();
  }
  return message;
};

export const search = async (page: string, limit: string, filter: string[]) => {
  console.log(`page: ${page}`);
  console.log(`limit: ${limit}`);
  console.log(`filter: ${filter}`);
  if (!filter) filter = []; // query에 filter가 없을 시 나타나는 에러 방지
  if (!filter.includes('proceeding') && !filter.includes('finish')) { // 둘다 선택 x
    console.log('둘다 선택 x');
  }
  if (filter.includes('proceeding') && filter.includes('finish')) { // 둘다 선택 x
    console.log('둘다 선택 O');
  } else if (filter.includes('proceeding')) // proceeding
  {
    console.log('proceeding');
  } else if (filter.includes('finish')) // finish
  {
    console.log('finish');
  }
  const data = await pool.query('SELECT * FROM book');
  const item = JSON.parse(JSON.stringify(data[0]));
  console.log(paginate(item, 150, parseInt(page)));
  return paginate(item, 150, parseInt(page));
};

export const cancel = async (reservationId: number): Promise<string> => {
  let message = ok;
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  try {
    const reservations = await transactionExecuteQuery(`
      SELECT status, bookId
      FROM reservation
      WHERE id = ?;
    `, [reservationId]);
    if (!reservations.length) {
      throw new Error(reservationNotExist);
    }
    if (reservations[0].status !== 0) {
      throw new Error(notReserved);
    }
    await transactionExecuteQuery(`
      UPDATE reservation
      SET status = 2
      WHERE id = ?;
    `, [reservationId]);
    if (reservations[0].bookId) {
      const candidates = await transactionExecuteQuery(`
        SELECT createdAt, id
        FROM reservation
        WHERE
          bookInfoId = (
            SELECT infoId
            FROM book
            WHERE id = ?
          ) AND
          status = 0
        ORDER BY createdAt ASC;
      `, [reservations[0].bookId]);
      if (candidates.length) {
        await transactionExecuteQuery(`
          UPDATE reservation
          SET bookId = ?, endAt = DATE_ADD(NOW(), INTERVAL 3 DAY)
          WHERE id = ?
        `, [reservations[0].bookId, candidates[0].id]);
      }
    }
  } catch (e) {
    conn.rollback();
    if (e instanceof Error) {
      message = e.message;
    }
  } finally {
    conn.release();
  }
  return message;
};

export const userCancel = async (userId: number, reservationId: number): Promise<string> => {
  const reservations = await executeQuery(`
    SELECT userId
    FROM reservation
    WHERE id = ?
  `, [reservationId]);
  if (reservations[0].userId !== userId) {
    return notMatchingUser;
  }
  return cancel(reservationId);
};

export const count = async (bookInfoId: string) => {
  console.log(`count bookInfoId: ${bookInfoId}`);
  const numberOfReservations = await executeQuery(`
    SELECT COUNT(*) as count
    FROM reservation
    WHERE bookInfoId = ? AND status = 0;
  `, [bookInfoId]);
  console.log(`numberOfReservations: ${numberOfReservations[0].count}`);
  return numberOfReservations[0];
};

export const userReservations = async (userId: string) => {
  console.log(`userReservations userId: ${userId}`);
  const reservationList = await executeQuery(`
    SELECT reservation.id as reservationId,
    reservation.bookInfoId as reservedBookInfoId,
    reservation.createdAt as reservationDate,
    reservation.endAt as endAt,
    (SELECT COUNT(*)
      FROM reservation
      WHERE status = 0
        AND bookInfoId = reservedBookInfoId
        AND createdAt <= reservationDate) as orderOfReservation,
    book_info.title as title,
    book_info.image as image
    FROM reservation
    LEFT JOIN book_info
    ON reservation.bookInfoId = book_info.id
    WHERE reservation.userId = ? AND reservation.status = 0;
  `, [userId]);
  console.log(`reservationList: ${reservationList}`);
  return reservationList;
};
