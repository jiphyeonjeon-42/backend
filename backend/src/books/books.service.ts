import { FieldPacket, RowDataPacket } from 'mysql2';
import Connection from 'mysql2/typings/mysql/lib/Connection';
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
