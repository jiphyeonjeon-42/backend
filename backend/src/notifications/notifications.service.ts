import { executeQuery } from '../mysql';
import { publishMessage } from '../slack/slack.service';

export const notifyReservation = async () => {
  const reservations: [{
      slack: string,
      title: string
    }] = await executeQuery(`
      SELECT
        user.slack AS slack,
        book_info.title AS title
      FROM
        reservation
      LEFT JOIN user ON
        user.id = reservation.userId
      LEFT JOIN book_info ON
        book_info.id = reservation.bookInfoId
      WHERE
        reservation.status = 0 AND
        DATE(reservation.updatedAt) = CURDATE()
    `);
  reservations.forEach((reservation) => {
    publishMessage(reservation.slack, `:books: 예약 알림 :books:\n예약하신 도서 \`${reservation.title}\`(이)가 대출 가능합니다. 3일 내로 집현전에 방문해 대출해주세요.`);
  });
};

export const notifyReservationOverdue = async () => {
  const reservations: [{
    slack: string,
    title: string,
    bookId: number,
    bookInfoId: number,
  }] = await executeQuery(`
    SELECT
      user.slack AS slack,
      book_info.title AS title,
      reservation.bookId AS bookId,
      reservation.bookInfoId AS bookInfoId
    FROM
      reservation
    LEFT JOIN user ON
      user.id = reservation.userId
    LEFT JOIN book_info ON
      book_info.id = reservation.bookInfoId
    WHERE
      reservation.status = 3 AND
      DATEDIFF(CURDATE(), DATE(reservation.endAt)) = 1
  `);
  reservations.forEach(async (reservation) => {
    publishMessage(reservation.slack, `:books: 예약 알림 :books:\n예약하신 도서 \`${reservation.title}\`의 예약이 만료되었습니다.`);
    const ranks: [{id: number, createdAt: Date}] = await executeQuery(`
      SELECT
        id,
        createdAt
      FROM
        reservation
      WHERE
        bookInfoId = ? AND status = 0
      ORDER BY createdAt ASC
    `, [reservation.bookInfoId]);
    await executeQuery(`
      UPDATE reservation
      SET
        bookId = ?,
        endAt = ADDDATE(CURDATE(),1)
      WHERE
        id = ?
    `, [reservation.bookId, ranks[0].id]);
  });
};

export const notifyReturningReminder = async () => {
  const lendings: [{title: string, slack: string}] = await executeQuery(`
    SELECT
      book_info.title,
      user.slack
    FROM
      lending
    LEFT JOIN book ON
      lending.bookId = book.id
    LEFT JOIN book_info ON
      book.infoId = book_info.id
    LEFT JOIN user ON
      lending.userId = user.id
    WHERE
      DATEDIFF(CURDATE(), lending.createdAt) = 11 AND
      lending.returnedAt IS NULL
  `);
  lendings.forEach(async (lending) => {
    publishMessage(lending.slack, `:books: 반납 알림 :books:\n 대출하신 도서 \`${lending.title}\`의 반납 기한이 다가왔습니다. 3일 내로 반납해주시기 바랍니다.`);
  });
};

export const notifyOverdue = async () => {
  const lendings: [{title: string, slack: string}] = await executeQuery(`
    SELECT
      book_info.title,
      user.slack
    FROM
      lending
    LEFT JOIN book ON
      lending.bookId = book.id
    LEFT JOIN book_info ON
      book.infoId = book_info.id
    LEFT JOIN user ON
      lending.userId = user.id
    WHERE
    DATEDIFF(CURDATE(), lending.createdAt) = 15 AND
    lending.returnedAt IS NULL
  `);
  lendings.forEach(async (lending) => {
    publishMessage(lending.slack, `:books: 연체 알림 :books:\n 대출하신 도서 \`${lending.title}\`가 연체되었습니다. 빠른 시일 내에 반납해주시기 바랍니다.`);
  });
};
