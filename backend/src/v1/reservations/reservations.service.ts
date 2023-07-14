import * as errorCode from '../utils/error/errorCode';
import { executeQuery, makeExecuteQuery, pool } from '../../mysql';
import { queriedReservationInfo, reservationInfo } from './reservations.type';
import { publishMessage } from '../slack/slack.service';
import ReservationsRepository from './reservations.repository';
import jipDataSource from '../../app-data-source';
import BooksRepository from '../books/books.repository';

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

export const create = async (userId: number, bookInfoId: number) => {
  const transactionQueryRunner = jipDataSource.createQueryRunner();
  await transactionQueryRunner.connect();
  const reservationRepo = new ReservationsRepository(transactionQueryRunner);
  const booksRepository = new BooksRepository();
  // bookInfoId가 유효한지 확인
  const numberOfBookInfo = await booksRepository.countBookInfos(bookInfoId);
  if (numberOfBookInfo === 0) {
    throw new Error(errorCode.INVALID_INFO_ID);
  }
  try {
    await transactionQueryRunner.startTransaction();
    if (await reservationRepo.isPenaltyUser(userId)) {
      throw new Error(errorCode.AT_PENALTY);
    }
    if (await reservationRepo.isOverdueUser(userId)) {
      throw new Error(errorCode.LENDING_OVERDUE);
    }
    if (await reservationRepo.isAllRenderUser(userId)) {
      throw new Error(errorCode.MORE_THAN_TWO_RESERVATIONS);
    }
    // bookInfoId가 모두 대출 중이거나 예약 중인지 확인
    // 대출 가능하면 예약 불가
    const cantReservBookInfo = await reservationRepo.getlenderableBookNum(bookInfoId);
    if (numberOfBookInfo > cantReservBookInfo) {
      throw new Error(errorCode.NOT_LENDED);
    }
    // 이미 대출한 bookInfoId가 아닌지 확인
    // 본인이 대출한 책에 예약 걸지 못하도록
    const lendedBook = await reservationRepo.alreadyLendedBooks(userId, bookInfoId);
    if (await lendedBook.getExists()) {
      throw new Error(errorCode.ALREADY_LENDED);
    }
    // user가 이미 예약한 bookInfoId가 아닌지 확인
    // 중첩해서 예약 거는 것을 방지하기 위해
    const reservedBooks = await reservationRepo.getReservedBooks(userId, bookInfoId);
    if (await reservedBooks.getExists()) {
      throw new Error(errorCode.ALREADY_RESERVED);
    }
    await reservationRepo.createReservation(userId, bookInfoId);
    const reservationPriority = await count(bookInfoId);
    await transactionQueryRunner.commitTransaction();
    return reservationPriority;
  } catch (e) {
    await transactionQueryRunner.rollbackTransaction();
    throw e;
  } finally {
    await transactionQueryRunner.release();
  }
};

export const search = async (query:string, page: number, limit: number, filter: string) => {
  const reservationRepo = new ReservationsRepository();
  const reservationList = await reservationRepo.searchReservations(query, filter, page, limit);
  return reservationList;
};

export const cancel = async (reservationId: number): Promise<void> => {
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  conn.beginTransaction();
  try {
    //  올바른 예약인지 확인.
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
    //  예약 취소 ( 2번 ) 으로 status 변경
    await transactionExecuteQuery(`
      UPDATE reservation
      SET status = 2
      WHERE id = ?;
    `, [reservationId]);
    //  bookId 가 있는 사람이 취소했으면 ( 0순위 예약자 )
    if (reservations[0].bookId) {
      //  예약자 (취소된 bookInfoId 로 예약한 사람) 중에 가장 빨리 예약한 사람 찾아서 반환
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
      //  그 사람이 존재한다면 예약 update 하고 예약 알림 보내기
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
