import { FieldPacket, RowDataPacket } from 'mysql2';
import { dbConnect } from '../mysql';
import { StringRows } from '../utils/types';

export interface BookInfo extends RowDataPacket {
  title: string,
  author: string,
  publisher: string,
  isbn?: string
  image: string,
  category: string,
  publishedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}

export interface BookEach extends RowDataPacket {
  donator: string,
  donatorId?: number,
  callSign: string,
  status: number,
  createdAt: Date,
  updatedAt: Date,
  infoId: number,
}

export interface Book {
  title: string,
  author: string,
  publisher: string,
  isbn: string
  image?: string,
  category: string,
  publishedAt?: Date,
  donator?: string,
  callSign: string,
  status: number,
}

interface categoryCount extends RowDataPacket {
  name: string,
  count: number,
}

export const createBook = async (book: Book): Promise<void> => {
  const connection = await dbConnect();
  const [result]: [StringRows[], FieldPacket[]] = (await connection.query(`
    SELECT
      isbn
    FROM book_info
    WHERE isbn = ?
  `, [book.isbn]));
  if (result.length === 0) {
    let image = null;
    if (!book.image) {
      image = `https://image.kyobobook.co.kr/images/book/xlarge/${book.isbn.slice(
        -3,
      )}/x${book.isbn}.jpg`;
    }
    await connection.query(`
    INSERT INTO book_info(
      title,
      author,
      publisher,
      isbn,
      image,
      categoryId,
      publishedAt
    ) VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      (
        SELECT
          id
        FROM category
        WHERE name = ?
      ),
      ?
    )`, [
      book.title,
      book.author,
      book.publisher,
      book.isbn,
      book.image ?? image,
      book.category,
      book.publishedAt,
    ]);
  }
  await connection.query(`
    INSERT INTO book(
      donator,
      donatorId,
      callSign,
      status,
      infoId
    ) VALUES (
      ?,
      (
        SELECT id
        FROM user
        WHERE login = ?
      ),
      ?,
      ?,
      (
        SELECT id
        FROM book_info
        WHERE isbn = ?
      )
    )
  `, [
    book.donator ?? 'null',
    book.donator ?? '0',
    book.callSign,
    book.status,
    book.isbn,
  ]);
};

export const deleteBook = async (book: Book): Promise<boolean> => {
  const connection = await dbConnect();
  const [result]: [BookEach[], FieldPacket[]] = (await connection.query(`
    SELECT *
    FROM book
    WHERE callSign = ?
  `, [book.callSign]));
  if (result.length === 0) {
    return false;
  }
  await connection.query(`
    DELETE FROM book
    WHERE callSign = ?
  `, [book.callSign]);
  if (result.length === 1) {
    await connection.query(`
      DELETE FROM book_info
      WHERE id = ?
    `, [result[0].infoId]);
  }
  return true;
};

export const searchInfo = async (
  query: string,
  sort: string,
  page: number,
  limit: number,
  category: string | null,
) => {
  let ordering = '';
  switch (sort) {
    case 'title':
      ordering = 'ORDER BY book_info.title';
      break;
      // case 'popular':
      //   ordering = 'ORDER BY count(lending.id) DESC';
      // break;
    case 'new':
      ordering = 'ORDER BY book_info.publishedAt DESC';
      break;
    default:
      ordering = 'ORDER BY book_info.createdAt DESC';
  }
  const connection = await dbConnect();
  const [categoryResult]: [StringRows[], FieldPacket[]] = await connection.query(`
    SELECT name
    FROM category
    WHERE name = ?
  `, [category]);
  const categoryName = categoryResult?.[0]?.name;
  const categoryWhere = categoryName ? `category.name = '${categoryName}'` : 'TRUE';
  const [categoryList]: [categoryCount[], FieldPacket[]] = await connection.query(`
    SELECT
      category.name AS name,
      count(name) AS count
    FROM book_info
    LEFT JOIN category ON book_info.categoryId = category.id
    WHERE (
      book_info.title LIKE ?
      OR book_info.author LIKE ?
      OR book_info.isbn LIKE ?
      ) AND (
        ${categoryWhere}
      )
    GROUP BY name;
  `, [`%${query}%`,
    `%${query}%`,
    `%${query}%`,
    `%${query}%`,
  ]);
  const categoryHaving = categoryName ? `category = '${categoryName}'` : 'TRUE';
  const [bookList]: [BookInfo[], FieldPacket[]] = await connection.query(`
    SELECT
      book_info.id AS id,
      book_info.title AS title,
      book_info.author AS author,
      book_info.publisher AS publisher,
      book_info.isbn AS isbn,
      book_info.image AS image,
      (
        SELECT name
        FROM category
        WHERE id = book_info.categoryId
      ) AS category,
      book_info.publishedAt as publishedAt,
      book_info.createdAt as createdAt,
      book_info.updatedAt as updatedAt
    FROM book_info
    WHERE (
      book_info.title like ?
      OR book_info.author like ?
      OR book_info.isbn like ?
      )
    HAVING ${categoryHaving}
    ${ordering}
    LIMIT 3
    OFFSET 0;
  `, [`%${query}%`,
    `%${query}%`,
    `%${query}%`,
    `%${query}%`,
    limit,
    page * limit,
  ]);
  return { items: bookList, categories: categoryList };
};
