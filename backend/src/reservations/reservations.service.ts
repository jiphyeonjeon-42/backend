import { executeQuery } from '../mysql';
import * as models from '../users/users.model';

export const
  searchReservation = async (query:string, page: number, limit: number, filter: string) => {
    let filterQuery;
    switch (filter) {
      case 'waiting':
        filterQuery = 'WHERE reservation.status = 0 AND reservation.bookId IS NULL';
        break;
      case 'expired':
        filterQuery = 'WHERE reservation.status > 0';
        break;
      case 'all':
        filterQuery = '';
        break;
      default:
        filterQuery = 'WHERE reservation.status = 0 AND reservation.bookId IS NOT NULL';
    }

    const items = (await executeQuery(`
      SELECT 
        reservation.id AS reservationsId,
        user.nickName AS login,
        DATEDIFF(now(), user.penaltyEndDay) AS penaltyDays,
        book.title,
        book.image,
        (
          SELECT callSign 
          FROM book
          WHERE book.id = reservation.bookId
        ) AS callSign,
        reservation.createdAt,
        endAt,
        status
      FROM reservation
      LEFT JOIN user AS user ON reservation.userId = user.id
      LEFT JOIN book_info AS book ON reservation.bookInfoId = book.id
      ${filterQuery}
      HAVING book.title LIKE ? OR login LIKE ? OR callSign LIKE ?
      LIMIT ?
      OFFSET ?
  `, [`%${query}%`, `%${query}%`, `%${query}%`, limit, limit * page]));
    const totalItems = (await executeQuery(`
      SELECT 
        reservation.id AS reservationsId,
        user.nickName AS login,
        book.title,
        (
          SELECT callSign 
          FROM book
          WHERE book.id = reservation.bookId
        ) AS callSign
      FROM reservation
      LEFT JOIN user AS user ON reservation.userId = user.id
      LEFT JOIN book_info AS book ON reservation.bookInfoId = book.id
      ${filterQuery}
      HAVING book.title LIKE '%a%' OR login LIKE '%a%' OR callSign LIKE '%a%'
    `, [`%${query}%`, `%${query}%`, `%${query}%`]));
    const meta :models.Meta = {
      totalItems: totalItems.length,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems.length / limit),
      currentPage: page + 1,
    };
    return { items, meta };
  };

export const a = 1;
