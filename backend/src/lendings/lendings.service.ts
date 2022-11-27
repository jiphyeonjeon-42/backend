/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
import { makeExecuteQuery, executeQuery, pool } from '../mysql';
import { publishMessage } from '../slack/slack.service';
import { Meta } from '../users/users.type';
import { formatDate } from '../utils/dateFormat';
import * as errorCode from '../utils/error/errorCode';

export const create = async (
  userId: number,
  bookId: number,
  librarianId: number,
  condition: string,
) => {
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  try {
    await conn.beginTransaction();
    // 존재하는 유저인지 확인
    const users = await transactionExecuteQuery(`
      SELECT *
      FROM user
      WHERE id = ?
    `, [userId]);
    if (!users.length) { throw new Error(errorCode.NO_USER_ID); }
    // 유저 권한 없음
    if (users[0].role === 0) { throw new Error(errorCode.NO_PERMISSION); }
    // 유저가 2권 이상 대출
    const numberOfLendings = await transactionExecuteQuery(`
      SELECT COUNT(*) as count
      FROM lending
      WHERE userId = ? AND returnedAt IS NULL;
    `, [userId]);
    if (numberOfLendings[0].count >= 2) { throw new Error(errorCode.LENDING_OVERLOAD); }

    // 유저가 연체중 (패널티를 받았거나 대출중인 책이 반납기한을 넘겼을때)
    const hasPenalty = await transactionExecuteQuery(`
      SELECT penaltyEndDate
      FROM user
      WHERE id = ?
    `, [userId]);
    const isOverdue = await transactionExecuteQuery(`
      SELECT
        CASE WHEN 14 >= DATEDIFF(NOW(), DATE(createdAt)) THEN 0
          ELSE  DATEDIFF(NOW(), DATE(createdAt))
        END AS overdue
      FROM lending
      WHERE userId = ? AND returnedAt IS NULL
    `, [userId]);
    if (hasPenalty[0].penaltyEndDate >= new Date()
      || isOverdue[0]?.overdue) { throw new Error(errorCode.LENDING_OVERDUE); }

    // 책이 대출되지 않은 상태인지
    const isNotLended = await transactionExecuteQuery(`
      SELECT *
      FROM lending
      WHERE bookId = ? AND returnedAt IS NULL
    `, [bookId]);
    if (isNotLended.length !== 0) { throw new Error(errorCode.ON_LENDING); }

    // 책이 분실, 파손이 아닌지
    const isLendableBook = await transactionExecuteQuery(`
     SELECT *
     FROM book
     WHERE id = ?
    `, [bookId]);
    if (isLendableBook[0].status === 1) {
      throw new Error(errorCode.DAMAGED_BOOK);
    } else if (isLendableBook[0].status === 2) {
      throw new Error(errorCode.LOST_BOOK);
    }

    // 예약된 책이 아닌지
    const isNotReservedBook = await transactionExecuteQuery(`
      SELECT *
      FROM reservation
      WHERE bookId = ? AND status = 0
      `, [bookId]);

    if (isNotReservedBook.length && isNotReservedBook[0].userId !== userId) {
      throw new Error(errorCode.ON_RESERVATION);
    }

    await transactionExecuteQuery(`
    INSERT INTO lending (userId, bookId, lendingLibrarianId, lendingCondition)
    VALUES (?, ?, ?, ?)
    `, [userId, bookId, librarianId, condition]);

    // 예약 대출 시 상태값 reservation status 0 -> 1 변경
    if (isNotReservedBook.length) {
      await transactionExecuteQuery(`
      UPDATE reservation
      SET status = 1
      WHERE id = ?
      `, [isNotReservedBook[0].id]);
    }

    const books: [{title: string}] = await transactionExecuteQuery(`
      SELECT
        title
      FROM
        book_info
      LEFT JOIN book ON
        book.infoId = book_info.id
      WHERE
        book.id = ?
    `, [bookId]);
    await conn.commit();
    publishMessage(users[0].slack, `:jiphyeonjeon: 대출 알림 :jiphyeonjeon: \n대출 하신 \`${books[0].title}\`은(는) ${formatDate(dueDate)}까지 반납해주세요.`);
  } catch (e) {
    await conn.rollback();
    if (e instanceof Error) {
      throw e;
    }
  } finally {
    conn.release();
  }
  return ({ dueDate: formatDate(dueDate) });
};

export const returnBook = async (
  librarianId: number,
  lendingId: number,
  condition: string,
) => {
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  try {
    await conn.beginTransaction();

    // 유효한 lendingId 인지, 반납처리가 이미 된 책인지 확인
    const lendingInfo = await transactionExecuteQuery(`
      SELECT *
      FROM lending
      WHERE id = ?
    `, [lendingId]);
    if (!lendingInfo || !lendingInfo[0]) {
      throw new Error(errorCode.NONEXISTENT_LENDING);
    } else if (lendingInfo[0].returnedAt) {
      throw new Error(errorCode.ALREADY_RETURNED);
    }

    await transactionExecuteQuery(`
      UPDATE lending
      SET returningLibrarianId = ?,
          returningCondition = ?,
          returnedAt = NOW()
      WHERE id = ?
    `, [librarianId, condition, lendingId]);

    // 연체 반납이라면 penaltyEndDate부여
    const today = new Date().setHours(0, 0, 0, 0);
    const createdDate = new Date(lendingInfo[0].createdAt);
    // eslint-disable-next-line max-len
    const expecetReturnDate = new Date(createdDate.setDate(createdDate.getDate() + 14)).setHours(0, 0, 0, 0);
    if (today > expecetReturnDate) {
      const todayDate = new Date();
      const overDueDays = (today - expecetReturnDate) / 1000 / 60 / 60 / 24;
      let confirmedPenaltyEndDate;
      const penaltyEndDateInDB = await transactionExecuteQuery(`SELECT DATE_FORMAT(penaltyEndDate, "%Y-%m-%d") as penaltyEndDate FROM user where id = ${lendingInfo[0].userId}`);
      // eslint-disable-next-line max-len
      const originPenaltyEndDate = new Date(penaltyEndDateInDB[0].penaltyEndDate);
      if (today < originPenaltyEndDate.setHours(0, 0, 0, 0)) {
        confirmedPenaltyEndDate = new Date(originPenaltyEndDate.setDate(originPenaltyEndDate.getDate() + overDueDays)).toISOString().split('T')[0];
      } else {
        confirmedPenaltyEndDate = new Date(todayDate.setDate(todayDate.getDate() + overDueDays)).toISOString().split('T')[0];
      }
      await transactionExecuteQuery(`UPDATE user set penaltyEndDate = "${confirmedPenaltyEndDate}" where id = ${lendingInfo[0].userId};`);
    }
    // 예약된 책이 있다면 예약 부여
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
        SET
          bookId = ?,
          endAt =  DATE_ADD(NOW(), INTERVAL 3 DAY)
        WHERE id = ?
    `, [lendingInfo[0].bookId, isReserved[0].id]);
      // 예약자에게 슬랙메시지 보내기
      const slackIdReservedUser = (await transactionExecuteQuery('SELECT slack from user where id = ?', [isReserved[0].userId]))[0].slack;
      const bookTitle = (await transactionExecuteQuery('SELECT title from book_info where id = (SELECT infoId FROM book WHERE id = ?)', [lendingInfo[0].bookId]))[0].title;
      publishMessage(slackIdReservedUser, `:jiphyeonjeon: 예약 알림 :jiphyeonjeon:\n예약하신 도서 \`${bookTitle}\`(이)가 대출 가능합니다. 3일 내로 집현전에 방문해 대출해주세요.`);
    }
    await conn.commit();
    if (isReserved && isReserved[0]) {
      return ({ reservedBook: true });
    }
    return ({ reservedBook: false });
  } catch (error) {
    await conn.rollback();
    if (error instanceof Error) {
      throw error;
    }
  } finally {
    conn.release();
  }
};

export const search = async (
  query: string,
  page: number,
  limit: number,
  sort:string,
  type: string,
) => {
  let filterQuery;
  switch (type) {
    case 'user':
      filterQuery = `and user.nickname LIKE '%${query}%'`;
      break;
    case 'title':
      filterQuery = `and book_info.title LIKE '%${query}%'`;
      break;
    case 'callSign':
      filterQuery = `and book.callSign LIKE '%${query}%'`;
      break;
    case 'bookId':
      filterQuery = `and lending.bookId = '${query}'`;
      break;
    default:
      filterQuery = `and (user.nickname LIKE '%${query}%' OR book_info.title LIKE '%${query}%' OR book.callSign LIKE '%${query}%')`;
  }
  const orderQuery = sort === 'new' ? 'DESC' : 'ASC';
  const items = await executeQuery(
    `
    SELECT
      lending.id AS id,
      lendingCondition,
      user.nickname AS login,
      CASE WHEN NOW() > user.penaltyEndDate THEN 0
        ELSE DATEDIFF(user.penaltyEndDate, now())
      END AS penaltyDays,
      book.callSign,
      book_info.title,
      lending.createdAt AS createdAt,
      DATE_ADD(lending.createdAt, interval 14 day) AS dueDate
    FROM lending
    JOIN user ON user.id = lending.userId
    JOIN book ON book.id = lending.bookId
    JOIN book_info ON book_info.id = book.infoID
    WHERE lending.returnedAt is NULL
    ${filterQuery}
    ORDER BY lending.createdAt ${orderQuery}
    LIMIT ?
    OFFSET ?
  `,
    [limit, limit * page],
  );
  const totalItems = await executeQuery(`
    SELECT
      lending.id AS id,
      lendingCondition,
      user.nickname AS login,
      CASE WHEN NOW() > user.penaltyEndDate THEN 0
        ELSE DATEDIFF(user.penaltyEndDate, now())
      END AS penaltyDays,
      book.callSign,
      book_info.title,
      lending.createdAt AS createdAt,
      DATE_ADD(lending.createdAt, interval 14 day) AS dueDate
    FROM lending
    JOIN user ON user.id = lending.userId
    JOIN book ON book.id = lending.bookId
    JOIN book_info ON book_info.id = book.infoID
    WHERE lending.returnedAt is NULL
    ${filterQuery}
  `);
  const meta: Meta = {
    totalItems: totalItems.length,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems.length / limit),
    currentPage: page + 1,
  };
  return { items, meta };
};

export const lendingId = async (id:number) => {
  const data = await executeQuery(`
    SELECT
    lending.id,
    lending.lendingCondition,
    DATE_FORMAT(lending.createdAt, '%Y.%m.%d') as createdAt,
    user.nickname as login,
    CASE
      WHEN user.penaltyEndDate < NOW() THEN 0
      ELSE DATEDIFF(user.penaltyEndDate, NOW())
    END AS penaltyDays,
    book.callSign,
    book_info.title as title,
    book_info.image as image,
    DATE_FORMAT(DATE_ADD(lending.createdAt, interval 14 day), '%Y.%m.%d') AS dueDate
    FROM lending
    JOIN user AS user ON user.id = lending.userId
    JOIN book ON book.id = lending.bookId
    JOIN book_info ON book_info.id = book.infoId
    WHERE lending.id = ?
  `, [id]);
  return data[0];
};
