import { executeQuery } from '../mysql';
import * as models from '../users/users.model';
import { logger } from '../utils/logger';
import { queriedReservationInfo, reservationInfo } from './reservations.type';

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
  conn.beginTransaction();
  try {
    // 연체 전적이 있는지 확인
    const userPenalty = await transactionExecuteQuery(`
      SELECT penaltyEndDate
      FROM user
      WHERE id = ?;
    `, [userId]);
    if (userPenalty.penaltyEndDate > new Date()) {
      throw new Error(atPenalty);
    }
    // 현재 대출 중인 책이 연체 중인지 확인
    // bookInfoId가 모두 대출 중인지 확인
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
      WHERE bookInfoId = ? AND userId = ? AND status = 0;
    `, [bookInfoId, userId]);
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
      INSERT INTO reservation (userId, bookInfoId)
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

export const
  search = async (query:string, page: number, limit: number, filter: string) => {
    logger.debug(`reservation search query: ${query} page: ${page} limit ${limit} filter ${filter}`);
    let filterQuery;
    switch (filter) {
      case 'waiting':
        filterQuery = 'WHERE reservation.status = 0 AND reservation.bookId IS NULL';
        break;
      case 'expired':
        filterQuery = 'WHERE reservation.status > 0';
        break;
      case 'all':
        filterQuery = '';
        break;
      default:
        filterQuery = 'WHERE reservation.status = 0 AND reservation.bookId IS NOT NULL';
    }

    const items = (await executeQuery(`
      SELECT
        reservation.id AS reservationsId,
        user.nickname AS login,
        CASE
          WHEN NOW() > user.penaltyEndDate THEN 0
          ELSE DATEDIFF(now(), user.penaltyEndDate)
        END AS penaltyDays,
        book.title,
        book.image,
        (
          SELECT callSign
          FROM book
          WHERE book.id = reservation.bookId
        ) AS callSign,
        DATE_FORMAT(reservation.createdAt, '%Y.%m.%d') AS createdAt,
        DATE_FORMAT(reservation.endAt, '%Y.%m.%d') AS endAt,
        status
      FROM reservation
      LEFT JOIN user AS user ON reservation.userId = user.id
      LEFT JOIN book_info AS book ON reservation.bookInfoId = book.id
      ${filterQuery}
      HAVING book.title LIKE ? OR login LIKE ? OR callSign LIKE ?
      LIMIT ?
      OFFSET ?
  `, [`%${query}%`, `%${query}%`, `%${query}%`, limit, limit * page]));
    const totalItems = (await executeQuery(`
      SELECT
        reservation.id AS reservationsId,
        user.nickName AS login,
        book.title,
        (
          SELECT callSign
          FROM book
          WHERE book.id = reservation.bookId
        ) AS callSign
      FROM reservation
      LEFT JOIN user AS user ON reservation.userId = user.id
      LEFT JOIN book_info AS book ON reservation.bookInfoId = book.id
      ${filterQuery}
      HAVING book.title LIKE ? OR login LIKE ? OR callSign LIKE ?
    `, [`%${query}%`, `%${query}%`, `%${query}%`]));
    const meta :models.Meta = {
      totalItems: totalItems.length,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems.length / limit),
      currentPage: page + 1,
    };
    return { items, meta };
  };

export const cancel = async (reservationId: number): Promise<string> => {
  let message = ok;
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  conn.beginTransaction();
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
  logger.debug(`count bookInfoId: ${bookInfoId}`);
  const numberOfReservations = await executeQuery(`
    SELECT COUNT(*) as count
    FROM reservation
    WHERE bookInfoId = ? AND status = 0;
  `, [bookInfoId]);
  logger.debug(`numberOfReservations: ${numberOfReservations[0].count}`);
  return numberOfReservations[0];
};

export const reservationKeySubstitution = (obj: queriedReservationInfo): reservationInfo => {
  const newObj: reservationInfo = {
    reservationId: obj.reservationId,
    bookInfoId: obj.reservedBookInfoId,
    createdAt: obj.reservationDate,
    endAt: obj.endAt,
    orderOfReservation: obj.orderOfReservation,
    title: obj.title,
    image: obj.image,
  };
  return newObj;
};

export const userReservations = async (userId: string) => {
  logger.debug(`userReservations userId: ${userId}`);
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
  `, [userId]) as [queriedReservationInfo];
  reservationList.forEach((obj) => reservationKeySubstitution(obj));
  logger.debug(`reservationList: ${reservationList}`);
  return reservationList;
};
