/* eslint-disable prefer-regex-literals */
/* eslint-disable prefer-destructuring */
import axios from 'axios';
import { executeQuery } from '../mysql';
import { StringRows } from '../utils/types';
import * as models from './books.model';
import * as types from './books.type';
import * as errorCode from '../utils/error/errorCode';
import { logger } from '../utils/logger';

export const search = async (
  query: string,
  page: number,
  limit: number,
) => {
  const bookList = (await executeQuery(
    `
    SELECT
      book.id AS id,
      book_info.title AS title,
      book_info.author AS author,
      book_info.publisher AS publisher,
      book_info.isbn AS isbn,
      book.callSign AS callSign,
      book_info.image as image,
      (
        SELECT name
        FROM category
        WHERE id = book_info.categoryId
      ) AS category,
      (
        IF((
            IF((select COUNT(*) from lending as l where l.bookId = book.id and l.returnedAt is NULL) = 0, TRUE, FALSE)
            AND
            IF((select COUNT(*) from book as b where (b.id = book.id and b.status = 0)) = 1, TRUE, FALSE)
            AND
            IF((select COUNT(*) from reservation as r where (r.bookId = book.id and status = 0)) = 0, TRUE, FALSE)
            ), TRUE, FALSE)
      ) AS isLendable 
    FROM book_info, book 
    WHERE book_info.id = book.infoId AND
    (book_info.title like ?
      OR book_info.author like ?
      OR book_info.isbn like ?)
    LIMIT ?
    OFFSET ?;
  `,
    [`%${query}%`, `%${query}%`, `%${query}%`, limit, page * limit],
  )) as models.BookInfo[];

  const totalItems = (await executeQuery(
    `
    SELECT
      COUNT(*) AS count
    FROM book_info
    INNER JOIN book ON book_info.id = book.infoId
    WHERE (
      book_info.title LIKE ?
      OR book_info.author LIKE ?
      OR book_info.isbn LIKE ?
      )
  `,
    [`%${query}%`, `%${query}%`, `%${query}%`],
  ))[0].count as number;

  const meta = {
    totalItems,
    itemCount: bookList.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page + 1,
  };
  return { items: bookList, meta };
};

const searchByIsbn = async (isbn: string) => {
  let book;
  await axios
    .get(
      `
  https://openapi.naver.com/v1/search/book_adv?d_isbn=${isbn}`,
      {
        headers: {
          'X-Naver-Client-Id': `${process.env.NAVER_BOOK_SEARCH_CLIENT_ID}`,
          'X-Naver-Client-Secret': `${process.env.NAVER_BOOK_SEARCH_SECRET}`,
        },
      },
    )
    .then((res) => {
      // eslint-disable-next-line prefer-destructuring
      book = res.data.items[0];
      book.isbn = book.isbn.split(' ')[1];
      book.image = `https://image.kyobobook.co.kr/images/book/xlarge/${book.isbn.slice(-3)}/x${book.isbn}.jpg`;
      delete book.price;
      delete book.discount;
      delete book.link;
      delete book.description;
    })
    .catch(() => {
      throw new Error(errorCode.ISBN_SEARCH_FAILED);
    });
  return ([book]);
};

export const createBook = async (book: types.CreateBookInfo) => {
  const isbnInBookInfo = (await executeQuery('SELECT COUNT(*) as cnt FROM book_info WHERE isbn = ? ', [book.isbn])) as StringRows[];

  const callSignValidator = (callSign : string) => {
    const regexConditon = new RegExp(/^[A-Oa-n][0-9]{1,}\.[0-9]{2}\.v[0-9]{1,}\.c[0-9]{1,}$/);
    if (regexConditon.test(callSign) === false) {
      throw new Error(errorCode.INVALID_CALL_SIGN);
    }
  };
  callSignValidator(book.callSign);

  const slackIdExist = (await executeQuery('SELECT COUNT(*) as cnt FROM user WHERE nickname = ?', [book.donator])) as StringRows[];
  if (slackIdExist[0].cnt > 1) {
    logger.warn(`${errorCode.SLACKID_OVERLAP}: nickname이 중복입니다. 최근에 가입한 user의 ID로 기부가 기록됩니다.`);
  }

  const callSignExist = (await executeQuery('SELECT COUNT(*) as cnt FROM book WHERE binary(callSign) = ? ', [book.callSign])) as StringRows[];
  if (callSignExist[0].cnt > 0) {
    throw new Error(errorCode.CALL_SIGN_OVERLAP);
  }
  const category = (await executeQuery(`SELECT name FROM category WHERE id = ${book.categoryId}`))[0].name;
  if (isbnInBookInfo[0].cnt === 0) {
    await executeQuery(
      `INSERT INTO book_info (title, author, publisher, isbn, image, categoryEnum, categoryId, publishedAt) 
      VALUES (?, ?, ?, (SELECT IF (? != 'NOTEXIST', ?, NULL)), (SELECT IF (? != 'NOTEXIST', ?, NULL)), ?, ?, ?)`,
      [
        book.title,
        book.author,
        book.publisher,
        book.isbn ? book.isbn : 'NOTEXIST',
        book.isbn ? book.isbn : 'NOTEXIST',
        book.image ? book.image : 'NOTEXIST',
        book.image ? book.image : 'NOTEXIST',
        category,
        book.categoryId,
        book.pubdate,
      ],
    );
  }
  await executeQuery(`INSERT INTO book(donator,donatorId,callSign,status,infoId) VALUES
    (?,(SELECT id FROM user WHERE nickname = ? ORDER BY createdAt DESC LIMIT 1),?,0,(SELECT id FROM book_info WHERE (isbn = ? or title = ?) ORDER BY createdAt DESC LIMIT 1))
  `, [book.donator, book.donator, book.callSign, book.isbn, book.title]);
  return ({ code: 200, message: 'DB에 insert 성공하였습니다.' });
};

export const createBookInfo = async (isbn: string) => {
  const isbnInBookInfo = (await executeQuery(
    `
    SELECT
      book.id AS id,
      book.callSign AS callSign,
      book_info.title AS title,
      book_info.author AS author,
      book_info.publisher AS publisher,
      book_info.isbn AS isbn,
      book_info.publishedAt AS pubdate,
      (
        SELECT name
        FROM category
        WHERE id = book_info.categoryId
      ) AS category    
    FROM book_info, book 
    WHERE book_info.id = book.infoId AND isbn = ?
  `,
    [isbn],
  )) as StringRows[];
  const isbnInNaver: any = await searchByIsbn(isbn);
  const sameTitleOrAuthor = await executeQuery(
    `
    SELECT
      book.id AS id,
      book.callSign AS callSign,
      book_info.title AS title,
      book_info.author AS author,
      book_info.publisher AS publisher,
      book_info.isbn AS isbn,
      book_info.publishedAt AS pubdate,
      (
        SELECT name
        FROM category
        WHERE id = book_info.categoryId
      ) AS category
    FROM book_info, book 
    WHERE book_info.id = book.infoId AND
    ( book_info.title like ? OR book_info.author like ?)
  `,
    [`%${isbnInNaver[0].title}%`, `%${isbnInNaver[0].author}%`],
  );
  return { isbnInNaver, isbnInBookInfo, sameTitleOrAuthor };
};

export const deleteBook = async (book: models.Book): Promise<boolean> => {
  const result = (await executeQuery(
    `
    SELECT *
    FROM book
    WHERE callSign = ?
  `,
    [book.callSign],
  )) as models.BookEach[];
  if (result.length === 0) {
    return false;
  }
  await executeQuery(
    `
    DELETE FROM book
    WHERE callSign = ?
  `,
    [book.callSign],
  );
  if (result.length === 1) {
    await executeQuery(
      `
      DELETE FROM book_info
      WHERE id = ?
    `,
      [result[0].infoId],
    );
  }
  return true;
};

export const sortInfo = async (
  limit: number,
  sort: string,
) => {
  let ordering = '';
  switch (sort) {
    case 'popular':
      ordering = 'ORDER BY lendingCnt DESC';
      break;
    default:
      ordering = 'ORDER BY book_info.createdAt DESC';
  }

  const bookList = (await executeQuery(
    `
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
      book_info.updatedAt as updatedAt,
      COUNT(lending.id) as lendingCnt
    FROM book_info LEFT JOIN lending
    ON book_info.id = lending.bookId
    GROUP BY book_info.id
    ${ordering}
    LIMIT ?;
  `,
    [limit],
  )) as models.BookInfo[];
  return { items: bookList };
};

export const searchInfo = async (
  query: string,
  page: number,
  limit: number,
  sort: string,
  category: string,
) => {
  let ordering = '';
  switch (sort) {
    case 'title':
      ordering = 'ORDER BY book_info.title';
      break;
    case 'popular':
      ordering = 'ORDER BY lendingCnt DESC, book_info.title';
      break;
    default:
      ordering = 'ORDER BY book_info.createdAt DESC, book_info.title';
  }
  const categoryResult = (await executeQuery(
    `
    SELECT name
    FROM category
    WHERE name = ?
  `,
    [category],
  )) as StringRows[];
  const categoryName = categoryResult?.[0]?.name;
  const categoryWhere = categoryName ? `category.name = '${categoryName}'` : 'TRUE';
  const categoryList = (await executeQuery(
    `
    SELECT
      IFNULL(category.name, "ALL") AS name,
      count(category.name) AS count
    FROM book_info
    RIGHT JOIN category ON book_info.categoryId = category.id
    WHERE (
      book_info.title LIKE ?
      OR book_info.author LIKE ?
      OR book_info.isbn LIKE ?
      )
    GROUP BY category.name WITH ROLLUP ORDER BY category.name ASC;
  `,
    [`%${query}%`, `%${query}%`, `%${query}%`],
  )) as models.categoryCount[];
  const categoryHaving = categoryName ? `category = '${categoryName}'` : 'TRUE';
  const bookList = (await executeQuery(
    `
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
      book_info.updatedAt as updatedAt,
      (
        SELECT COUNT(id) FROM lending WHERE lending.bookId = book_info.id
      ) as lendingCnt
    FROM book_info
    WHERE
    (
      book_info.title like ?
      OR book_info.author like ?
      OR book_info.isbn like ?
    )
    GROUP BY book_info.id
    HAVING ${categoryHaving}
    ${ordering}
    LIMIT ?
    OFFSET ?;
  `,
    [`%${query}%`, `%${query}%`, `%${query}%`, limit, page * limit],
  )) as models.BookInfo[];

  const totalItems = (await executeQuery(
    `
    SELECT
      count(category.name) AS count
    FROM book_info
    LEFT JOIN category ON book_info.categoryId = category.id
    WHERE (
      book_info.title LIKE ?
      OR book_info.author LIKE ?
      OR book_info.isbn LIKE ?
      ) AND (${categoryWhere})
  `,
    [`%${query}%`, `%${query}%`, `%${query}%`],
  ))[0].count as number;

  const meta = {
    totalItems,
    itemCount: bookList.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page + 1,
  };
  return { items: bookList, categories: categoryList, meta };
};

export const getInfo = async (id: string) => {
  const [bookSpec] = (await executeQuery(
    `
    SELECT
      id,
      title,
      author,
      publisher,
      isbn,
      image,
      (
        SELECT name
        FROM category
        WHERE id = book_info.categoryId
      ) AS category,
      book_info.publishedAt as publishedAt
    FROM book_info
    WHERE
      id = ?
  `,
    [id],
  )) as models.BookInfo[];
  if (bookSpec === undefined) {
    throw new Error(errorCode.NO_BOOK_INFO_ID);
  }
  if (bookSpec.publishedAt) {
    const date = new Date(bookSpec.publishedAt);
    bookSpec.publishedAt = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  }

  const eachBooks = (await executeQuery(
    `
    SELECT
      id,
      callSign,
      donator
    FROM book
    WHERE
      infoId = ?
  `,
    [id],
  )) as models.BookEach[];

  const books = await Promise.all(
    eachBooks.map(async (eachBook) => {
      const isLendable = await executeQuery(
        `SELECT (
        IF((
             IF((select COUNT(*) from lending as l where l.bookId = ${eachBook.id} and l.returnedAt is NULL) = 0, TRUE, FALSE)
             AND
             IF((select COUNT(*) from book as b where (b.id = ${eachBook.id} and b.status = 0)) = 1, TRUE, FALSE)
             AND
             IF((select COUNT(*) from reservation as r where (r.bookId = ${eachBook.id} and status = 0)) = 0, TRUE, FALSE)
           ), TRUE, FALSE)
        ) AS isLendable `,
      ).then((isLendableArr) => isLendableArr[0].isLendable);
      let dueDate;
      if (isLendable === 0) {
        dueDate = await executeQuery(
          `
        SELECT
          DATE_ADD(createdAt, INTERVAL 14 DAY) as dueDate
        FROM lending
        WHERE
          bookId = ?
        ORDER BY createdAt DESC
        LIMIT 1;
      `,
          [eachBook.id],
        ).then((dueDateArr) => dueDateArr[0].dueDate);
      } else {
        dueDate = '-';
      }
      const { ...rest } = eachBook;
      return { ...rest, dueDate, isLendable };
    }),
  );
  bookSpec.books = books;
  return bookSpec;
};
