import { executeQuery } from '../mysql';
import { logger } from '../utils/logger';
import * as Models from '../users/users.model';

export const
  search = async (query: string, page: number, limit: number, sort:string, type: string) => {
    logger.debug(`lending search query: ${query} page: ${page} limit: ${limit} sort: ${sort} type: ${type}`);
    let filterQuery;
    switch (type) {
      case 'user':
        filterQuery = `HAVING login LIKE '%${query}%'`;
        break;
      case 'title':
        filterQuery = `HAVING title LIKE '%${query}%'`;
        break;
      case 'callSign':
        filterQuery = `HAVING callSign LIKE '%${query}%'`;
        break;
      default:
        filterQuery = `HAVING login LIKE '%${query}%' OR title LIKE '%${query}%' OR callSign LIKE '%${query}%'`;
    }
    const orderQuery = sort === 'new' ? 'DESC' : '';
    const items = await executeQuery(`
    SELECT
      lending.id,
      lendingCondition,
      user.nickname as login, 
      CASE WHEN NOW() > user.penaltyEndDay THEN 0
        ELSE DATEDIFF(now(), user.penaltyEndDay) 
      END AS penaltyDays,
      (
          SELECT callSign
          FROM book
          WHERE id = bookId
      ) as callSign,
      (
        SELECT title
        FROM book_info
        WHERE id = bookId
      ) AS title,
      DATE_FORMAT(DATE_ADD(lending.createdAt, interval 14 day), '%Y.%m.%d') AS dueDate
    FROM lending
    JOIN user AS user ON lending.userId = user.id
    ${filterQuery}
    ORDER BY lending.createdAt ${orderQuery}
    LIMIT ?
    OFFSET ?
  `, [limit, limit * page]);
    const totalItems = await executeQuery(`
    SELECT
      lending.id,
      (
        SELECT nickname
        FROM user
        WHERE id = userId
      ) AS login, 
      (
        SELECT callSign
        FROM book
        WHERE id = bookId
      ) AS callSign,
      (
        SELECT title
        FROM book_info
        WHERE id = bookId
      ) AS title
    FROM lending
    ${filterQuery}
  `);
    const meta: Models.Meta = {
      totalItems: totalItems.length,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems.length / limit),
      currentPage: page + 1,
    };
    return { items, meta };
  };

export const a = 1;
