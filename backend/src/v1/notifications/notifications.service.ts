import { executeQuery } from '~/mysql';
import { publishMessage } from '../slack/slack.service';
import { handleReservationOverdueAndAssignReservationToNextWaitingUser } from '../reservations/reservations.service';
import { logger } from '~/logger';

const sendSlackMessage = async (slack: string, message: string) => {
  try {
    await publishMessage(slack, message);
  } catch (error) {
    logger.error('[scheduler error(slack)]', error);
  }
};

/**
 * 만료된 예약을 처리하고, 다음 예약자에게 할당하고, 슬랙 메시지를 전송합니다.
 * @throws 만료된 예약를 처리하고, 다음 예약자에게 할당하는 쿼리 과정에서 에러가 발생하면 에러를 던집니다. 슬랙 메시지 전송 실패시엔 로그만 남깁니다.
 */
export const notifyReservationOverdueAndNotifyReservation = async () => {
  const { overDueReservations, assignedReservations } = await handleReservationOverdueAndAssignReservationToNextWaitingUser();
  await Promise.allSettled(overDueReservations.map(({slack, title}) => sendSlackMessage(slack, `:jiphyeonjeon: 예약 만료 알림 :jiphyeonjeon:\n예약하신 도서 \`${title}\`의 예약이 만료되었습니다.`)));
  await Promise.allSettled(assignedReservations.map((data) => sendSlackMessage(data!.slack, `:jiphyeonjeon: 예약 알림 :jiphyeonjeon:\n예약하신 도서 \`${data!.title}\`(이)가 대출 가능합니다. 3일 내로 집현전에 방문해 대출해주세요.`,)));
};

/**
 * @deprecated notifyOverdueManager로 대체
 */
export const notifyReturningReminder = async () => {
  const lendings: [{ title: string; slack: string }] = await executeQuery(`
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
    await publishMessage(
      lending.slack,
      `:jiphyeonjeon: 반납 알림 :jiphyeonjeon:\n 대출하신 도서 \`${ lending.title }\`의 반납 기한이 다가왔습니다. 3일 내로 반납해주시기 바랍니다.`,
    );
  });
};

type Lender = { title: string; slack: string; daysLeft: number };

// day : 반납까지 남은 기한.
// 반납기한이 N일 남은 유저의 목록을 가져옵니다.
export const GetUserFromNDaysLeft = async (day: number): Promise<Lender[]> => {
  const LOAN_PERIOD = 14;
  const daysLeft = LOAN_PERIOD - day;
  const lendings: Lender[] = await executeQuery(`
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
      DATEDIFF(CURDATE(), lending.createdAt) = ${daysLeft} AND
      lending.returnedAt IS NULL
    `);
  return lendings.map(({ ...args }) => ({ ...args, daysLeft: day }));
};

const notifyUser = ({ slack, title, daysLeft }: Lender) =>
  publishMessage(
    slack,
    `:jiphyeonjeon: 반납 알림 :jiphyeonjeon:\n 대출하신 도서 \`${title}\`의 반납 기한이 다가왔습니다. ${daysLeft}일 내로 반납해주시기 바랍니다.`,
  );

export const notifyUsers = async (userList: Lender[], notifyFn: (_: Lender) => Promise<void>) => {
  await Promise.all(userList.map(notifyFn));
};

// 반납기한 3일전, 1일전, 당일날 알림을 발송합니다.
export const notifyOverdueManager = async () => {
  await notifyUsers(await GetUserFromNDaysLeft(0), notifyUser);
  await notifyUsers(await GetUserFromNDaysLeft(1), notifyUser);
  await notifyUsers(await GetUserFromNDaysLeft(3), notifyUser);
};

export const notifyOverdue = async () => {
  const lendings: [{ title: string; slack: string }] = await executeQuery(`
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
    DATEDIFF(CURDATE(), lending.createdAt) >= 15 AND
    lending.returnedAt IS NULL
  `);
  lendings.forEach(async (lending) => {
    publishMessage(
      lending.slack,
      `:jiphyeonjeon: 연체 알림 :jiphyeonjeon:\n 대출하신 도서 \`${lending.title}\`가 연체되었습니다. 빠른 시일 내에 반납해주시기 바랍니다.`,
    );
  });
};
