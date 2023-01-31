/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
import { makeExecuteQuery, executeQuery, pool } from '../mysql';
import { publishMessage } from '../slack/slack.service';
import { Meta } from '../users/users.type';
import { formatDate } from '../utils/dateFormat';
import * as errorCode from '../utils/error/errorCode';
import usersRepository from '../users/users.repository';
import lendingRepo from './lendings.repository';

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
    // TODO => apply transaction
    // TODO => begin tran
    await conn.beginTransaction();
    const [users, count] = await usersRepository.searchUserBy({ userId }, 0, 0);
    if (!count) { throw new Error(errorCode.NO_USER_ID); }
    if (users[0].role === 0) { throw new Error(errorCode.NO_PERMISSION); }

    // user conditions
    const numberOfLendings = (await lendingRepo.searchLending({
      userId,
      returnedAt: null,
    }, 0, 0))[1];
    if (numberOfLendings >= 2) { throw new Error(errorCode.LENDING_OVERLOAD); }
    const penaltyEndDate = await lendingRepo.getUsersPenalty(userId);
    const overDueDay = await lendingRepo.getUsersOverDueDay(userId);
    if (penaltyEndDate >= new Date()
      || overDueDay) { throw new Error(errorCode.LENDING_OVERDUE); }

    // book conditions
    const lendingList = await lendingRepo.searchLendingByBookId(bookId);
    if (lendingList.length !== 0) { throw new Error(errorCode.ON_LENDING); }

    // 책이 분실, 파손이 아닌지
    const book = await lendingRepo.searchBookForLending(bookId);
    if (book?.status === 1) {
      throw new Error(errorCode.DAMAGED_BOOK);
    } else if (book?.status === 2) {
      throw new Error(errorCode.LOST_BOOK);
    }

    // 예약된 책이 아닌지
    const reservationOfBook = await lendingRepo.searchReservationByBookId(bookId);
    if (reservationOfBook && reservationOfBook.user.id !== userId) {
      throw new Error(errorCode.ON_RESERVATION);
    }
    // 책 대출 정보 insert
    await lendingRepo.createLending(userId, bookId, librarianId, condition);
    // 예약 대출 시 상태값 reservation status 0 -> 1 변경
    if (reservationOfBook) { await lendingRepo.updateReservation(reservationOfBook.id); }
    // TODO => commit tran
    // commit tran

    await conn.commit();
    if (users[0].slack) {
      publishMessage(users[0].slack, `:jiphyeonjeon: 대출 알림 :jiphyeonjeon: \n대출 하신 \`${book?.info?.title}\`은(는) ${formatDate(dueDate)}까지 반납해주세요.`);
    }
  } catch (e) {
    // TODO => rollback
    await conn.rollback();
    if (e instanceof Error) {
      throw e;
    }
  } finally {
    // TODO => release
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
