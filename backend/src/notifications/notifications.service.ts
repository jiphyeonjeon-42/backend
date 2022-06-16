import { executeQuery } from '../mysql';
import { publishMessage } from '../slack/slack.service';

export const notifyReservation = async () => {
  const users: [{
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
  users.forEach((user) => {
    publishMessage(user.slack, `:robot_face: 집현전 봇 :robot_face:\n예약하신 도서 \`${user.title}\`(이)가 대출 가능합니다. 3일 내로 집현전에 방문해 대출해주세요.`);
  });
};

export const notifyLending = async () => {};
