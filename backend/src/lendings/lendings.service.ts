// search할때 사용하는 sql문들
import { executeQuery } from '../mysql';

export const temp = 'temp';

export const lendingId = async (id:number) => {
  const data = await executeQuery(`
    SELECT
    lending.id,
    lending.lendingCondition,
    DATE_FORMAT(lending.createdAt, '%Y.%m.%d') as createdAt,
    user.nickname as login,
    CASE
      WHEN user.penaltyEndDate < NOW() THEN 0
      ELSE DATEDIFF(NOW(), user.penaltyEndDate)
    END AS penaltyDays,
    (
        SELECT callSign
        FROM book
        WHERE book.id = lending.bookId
    ) as callSign,
    book.title as title,
    book.image as image,
    DATE_FORMAT(DATE_ADD(lending.createdAt, interval 14 day), '%Y.%m.%d') AS dueDate
    FROM lending
    JOIN user AS user ON user.id = lending.userId
    JOIN book_info AS book ON book.id = lending.bookId
    WHERE lending.id = ?
  `, [id]);
  return data;
};
