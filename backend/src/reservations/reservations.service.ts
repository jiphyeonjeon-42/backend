import * as errorCode from '../utils/error/errorCode';
import { executeQuery, makeExecuteQuery, pool } from '../mysql';
import { Meta } from '../users/users.type';
import { queriedReservationInfo, reservationInfo } from './reservations.type';
import { publishMessage } from '../slack/slack.service';

export const create = async (userId: number, bookInfoId: number) => {
  // bookInfoId가 유효한지 확인
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  const numberOfBookInfo = await executeQuery(`
    SELECT COUNT(*) as count
    FROM book
    WHERE infoId = ? AND status = 0;
  `, [bookInfoId]);
  if (numberOfBookInfo[0].count === 0) {
    throw new Error(errorCode.INVALID_INFO_ID);
  }
  conn.beginTransaction();
  try {
    // 연체 전적이 있는지 확인
    const userPenalty = await transactionExecuteQuery(`
      SELECT DATE_FORMAT(penaltyEndDate, "%Y-%m-%d") as penaltyEndDate
      FROM user
      WHERE id = ?;
    `, [userId]);
    if (userPenalty.penaltyEndDate > new Date()) {
      throw new Error(errorCode.AT_PENALTY);
    }
    // 현재 대출 중인 책이 연체 중인지 확인
    const overdueBooks = await transactionExecuteQuery(`
      SELECT
        DATE_ADD(createdAt, INTERVAL 14 DAY) as duedate
      FROM lending
      WHERE userId = ? AND returnedAt IS NULL
      ORDER BY createdAt ASC
    `, [userId]);
    if (overdueBooks?.[0]?.duedate < new Date()) {
      throw new Error(errorCode.AT_PENALTY);
    }
    // bookInfoId가 모두 대출 중이거나 예약 중인지 확인
    const cantReservBookInfo = await executeQuery(`
    SELECT COUNT(*) as count
    FROM book
    LEFT JOIN lending ON lending.bookId = book.id
    LEFT JOIN reservation ON reservation.bookId = lending.bookId
    WHERE
      book.infoId = ? AND book.status = 0 AND
      (lending.returnedAt IS NULL OR reservation.status = 0);
  `, [bookInfoId]);
    if (numberOfBookInfo[0].count > cantReservBookInfo[0].count) {
      throw new Error(errorCode.NOT_LENDED);
    }
    // 이미 대출한 bookInfoId가 아닌지 확인
    const lendedBook = await transactionExecuteQuery(`
      SELECT book.id
      FROM lending
      LEFT JOIN book ON book.id = lending.bookId
      WHERE
        lending.userId = ? AND
        lending.returnedAt IS NULL AND
        book.infoId = ?
    `, [userId, bookInfoId]);
    if (lendedBook.length) {
      throw new Error(errorCode.ALREADY_LENDED);
    }
    // 이미 예약한 bookInfoId가 아닌지 확인
    const reservedBook = await transactionExecuteQuery(`
      SELECT id
      FROM reservation
      WHERE bookInfoId = ? AND userId = ? AND status = 0;
    `, [bookInfoId, userId]);
    if (reservedBook.length) {
      throw new Error(errorCode.ALREADY_RESERVED);
    }
    // 예약한 횟수가 2회 미만인지 확인
    const reserved = await transactionExecuteQuery(`
      SELECT id
      FROM reservation
      WHERE userId = ? AND status = 0;
    `, [userId]);
    if (reserved.length >= 2) {
      throw new Error(errorCode.MORE_THAN_TWO_RESERVATIONS);
    }
    await transactionExecuteQuery(`
      INSERT INTO reservation (userId, bookInfoId)
      VALUES (?, ?)
    `, [userId, bookInfoId]);
    // eslint-disable-next-line no-use-before-define
    const reservationPriorty : any = count(bookInfoId);
    conn.commit();
    return reservationPriorty;
  } catch (e) {
    conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

export const
  search = async (query:string, page: number, limit: number, filter: string) => {
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
          ELSE DATEDIFF(user.penaltyEndDate, now())
        END AS penaltyDays,
        book_info.title,
        book_info.image,
        (
          SELECT callSign
          FROM book
          WHERE id = bookId
        ) AS callSign,
        reservation.createdAt AS createdAt,
        reservation.endAt AS endAt,
        reservation.status,
        user.id AS userId,
        reservation.bookId AS bookId
      FROM reservation
      LEFT JOIN user ON reservation.userId = user.id
      LEFT JOIN book_info ON reservation.bookInfoId = book_info.id
      ${filterQuery}
      HAVING book_info.title LIKE ? OR login LIKE ? OR callSign LIKE ?
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
    const meta : Meta = {
      totalItems: totalItems.length,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems.length / limit),
      currentPage: page + 1,
    };
    return { items, meta };
  };

export const cancel = async (reservationId: number): Promise<void> => {
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  conn.beginTransaction();
  try {
    const reservations: {
      status: number,
      bookId: string,
      title: string,
    }[] = await transactionExecuteQuery(`
      SELECT
        reservation.status AS status,
        reservation.bookId AS bookId,
        book_info.title AS title
      FROM reservation
      LEFT JOIN book_info
      ON book_info.id = reservation.bookInfoId
      WHERE reservation.id = ?
    `, [reservationId]);
    if (!reservations.length) {
      throw new Error(errorCode.RESERVATION_NOT_EXIST);
    }
    if (reservations[0].status !== 0) {
      throw new Error(errorCode.NOT_RESERVED);
    }
    await transactionExecuteQuery(`
      UPDATE reservation
      SET status = 2
      WHERE id = ?;
    `, [reservationId]);
    if (reservations[0].bookId) {
      const candidates: {id: number, slack: string}[] = await transactionExecuteQuery(`
        SELECT
          reservation.id AS id,
          user.slack AS slack
        FROM reservation
        LEFT JOIN user
        ON user.id = reservation.userId
        WHERE
          reservation.bookInfoId = (
            SELECT infoId
            FROM book
            WHERE id = ?
          ) AND
          reservation.status = 0
        ORDER BY reservation.createdAt ASC;
      `, [reservations[0].bookId]);
      if (candidates.length) {
        await transactionExecuteQuery(`
          UPDATE reservation
          SET bookId = ?, endAt = DATE_ADD(NOW(), INTERVAL 3 DAY)
          WHERE id = ?
        `, [reservations[0].bookId, candidates[0].id]);
        publishMessage(candidates[0].slack, `:jiphyeonjeon: 예약 알림 :jiphyeonjeon:\n예약하신 도서 \`${reservations[0].title}\`(이)가 대출 가능합니다. 3일 내로 집현전에 방문해 대출해주세요. (방문하시기 전에 비치 여부를 확인해주세요)`);
      }
    }
    conn.commit();
  } catch (e: any) {
    conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

export const userCancel = async (userId: number, reservationId: number): Promise<void> => {
  const reservations = await executeQuery(`
    SELECT userId
    FROM reservation
    WHERE id = ?
  `, [reservationId]);
  if (!reservations.length) {
    throw new Error(errorCode.RESERVATION_NOT_EXIST);
  }
  if (reservations[0].userId !== userId) {
    throw new Error(errorCode.NO_MATCHING_USER);
  }
  cancel(reservationId);
};

export const count = async (bookInfoId: number) => {
  const numberOfBookInfo = await executeQuery(`
    SELECT COUNT(*) as count
    FROM book
    WHERE infoId = ? AND status = 0;
  `, [bookInfoId]);
  if (numberOfBookInfo[0].count === 0) {
    throw new Error(errorCode.INVALID_INFO_ID);
  }
  // bookInfoId가 모두 대출 중이거나 예약 중인지 확인
  const cantReservBookInfo = await executeQuery(`
  SELECT COUNT(*) as count
  FROM book
  LEFT JOIN lending ON lending.bookId = book.id
  LEFT JOIN reservation ON reservation.bookId = lending.bookId
  WHERE
    book.infoId = ? AND book.status = 0 AND
    (lending.returnedAt IS NULL OR reservation.status = 0);
`, [bookInfoId]);
  if (numberOfBookInfo[0].count > cantReservBookInfo[0].count) {
    throw new Error(errorCode.NOT_LENDED);
  }
  const numberOfReservations = await executeQuery(`
    SELECT COUNT(*) as count
    FROM reservation
    WHERE bookInfoId = ? AND status = 0;
  `, [bookInfoId]);
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

export const userReservations = async (userId: number) => {
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
  return reservationList;
};
