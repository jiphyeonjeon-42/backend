import { executeQuery } from '../mysql';

export const
  search = async (query: string, page: number, limit: number, sort:string, type: string) => {
    let filterQuery;
    switch (type) {
      case 'user':
        filterQuery = `HAVING login LIKE '%${query}%'`;
        break;
      case 'title':
        filterQuery = `HAVING title LIKE '%${query}%'`;
        break;
      case 'callSign':
        filterQuery = `HAVING callSign LIKE '%UPPER(${query})%'`;
        break;
      default:
        filterQuery = `HAVING login LIKE '%${query}%' OR title LIKE '%${query}%' OR callSign LIKE '%${query}%'`;
    }
    const orderQuery = sort === 'new' ? 'DESC' : '';
    const result = await executeQuery(`
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
  `);
    return result;
  };

export const a = 1;
