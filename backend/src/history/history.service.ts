import { executeQuery } from '../mysql';
import { Meta } from '../users/users.type';

// eslint-disable-next-line import/prefer-default-export
export const history = async (
  query: string,
  who: string,
  userId: number,
  type: string,
  page: number,
  limit: number,
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

  if (who === 'my') {
    filterQuery += `and lending.userId = ${userId}`;
  }

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
    ${filterQuery}
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
