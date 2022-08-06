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

const getInfoInNationalLibrary = async (isbn: string) => {
  let book;
  let searchResult;
  await axios
    .get(`https://www.nl.go.kr/seoji/SearchApi.do?cert_key=${process.env.NATION_LIBRARY_KEY}&result_style=json&page_no=1&page_size=10&isbn=${isbn}`)
    .then((res) => {
      searchResult = res.data.docs[0];
      const {
        // eslint-disable-next-line max-len
        TITLE: title, AUTHOR: author, SUBJECT: category, PUBLISHER: publisher, PUBLISH_PREDATE: pubdate,
      } = searchResult;
      const image = `https://image.kyobobook.co.kr/images/book/xlarge/${isbn.slice(-3)}/x${isbn}.jpg`;
      book = {
        title, image, author, category, isbn, publisher, pubdate,
      };
    })
    .catch(() => {
      throw new Error(errorCode.ISBN_SEARCH_FAILED);
    });
  return (book);
};

export const createBook = async (book: types.CreateBookInfo) => {
  let recommendCopyNum;
  let recommendPrimaryNum;
  let categoryAlpabet;

  const isbnInBookInfo = (await executeQuery('SELECT COUNT(*) as cnt, isbn FROM book_info WHERE isbn = ?', [book.isbn])) as StringRows[];
  const slackIdExist = (await executeQuery('SELECT COUNT(*) as cnt FROM user WHERE nickname = ?', [book.donator])) as StringRows[];
  if (slackIdExist[0].cnt > 1) {
    logger.warn(`${errorCode.SLACKID_OVERLAP}: nickname이 중복입니다. 최근에 가입한 user의 ID로 기부가 기록됩니다.`);
  }

  const category = (await executeQuery(`SELECT name FROM category WHERE id = ${book.categoryId}`))[0].name;
  const getCategoryAlpabet = (categoryId : number) => {
    switch (categoryId) {
      case 1:
        return 'K';
      case 2:
        return 'C';
      case 3:
        return 'O';
      case 4:
        return 'A';
      case 5:
        return 'I';
      case 6:
        return 'G';
      case 7:
        return 'J';
      case 8:
        return 'c';
      case 9:
        return 'F';
      case 10:
        return 'E';
      case 11:
        return 'e';
      case 12:
        return 'H';
      case 13:
        return 'd';
      case 14:
        return 'D';
      case 15:
        return 'k';
      case 16:
        return 'c';
      case 17:
        return 'B';
      case 18:
        return 'e';
      case 19:
        return 'n';
      case 20:
        return 'N';
      case 21:
        return 'j';
      case 22:
        return 'a';
      case 23:
        return 'f';
      case 24:
        return 'L';
      case 25:
        return 'b';
      case 26:
        return 'M';
      case 27:
        return 'i';
      case 28:
        return 'l';
      default:
        return 'ERROR';
    }
  };

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
    recommendPrimaryNum = (await executeQuery('SELECT COUNT(*) + 1 as recommendPrimaryNum FROM book_info where categoryId = ?', [book.categoryId]))[0].recommendPrimaryNum;
    recommendCopyNum = 1;
    categoryAlpabet = getCategoryAlpabet(Number(book.categoryId));
  } else {
    recommendPrimaryNum = (await executeQuery('SELECT substring(substring_index(callsign, ".", 1),2) as recommendPrimaryNum FROM book WHERE infoId = (select id from book_info where isbn = ?)', [book.isbn]))[0].recommendPrimaryNum;
    recommendCopyNum = (await executeQuery('SELECT MAX(convert(substring(substring_index(callsign, ".", -1),2), unsigned)) + 1 as recommendCopyNum FROM book WHERE infoId = (select id from book_info where isbn = ?)', [book.isbn]))[0].recommendCopyNum;
    categoryAlpabet = (await executeQuery('SELECT substring(callsign,1,1) as categoryAlpabet FROM book WHERE infoId = (select id from book_info where isbn = ?)', [book.isbn]))[0].categoryAlpabet;
  }
  const recommendCallSign = `${categoryAlpabet}${recommendPrimaryNum}.${String(book.pubdate).slice(2, 4)}.v1.c${recommendCopyNum}`;
  await executeQuery(`INSERT INTO book(donator,donatorId,callSign,status,infoId) VALUES
    (?,(SELECT id FROM user WHERE nickname = ? ORDER BY createdAt DESC LIMIT 1),?,0,(SELECT id FROM book_info WHERE (isbn = ? or title = ?) ORDER BY createdAt DESC LIMIT 1))
  `, [book.donator, book.donator, recommendCallSign, book.isbn, book.title]);
  return ({ callsign: recommendCallSign });
};

export const createBookInfo = async (isbn: string) => {
  const bookInfo: any = await getInfoInNationalLibrary(isbn);
  return { bookInfo };
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
    ON book_info.id = (SELECT book.infoId FROM book WHERE lending.bookId = book.id LIMIT 1)
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

export const getBookById = async (id: string) => {
  const book = (await executeQuery(`
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
    FROM book_info JOIN book 
    ON book_info.id = book.infoId
    WHERE book.id = ?
    LIMIT 1;
    `, [id]))[0];
  if (book === undefined) { throw new Error(errorCode.NO_BOOK_ID); }
  return book;
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
      donator,
      status
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
        ) AS isLendable`,
      ).then((isLendableArr) => isLendableArr[0].isLendable);
      const isReserved = await executeQuery(
        `SELECT IF(
            (select COUNT(*) from reservation as r where (r.bookId = ${eachBook.id} and status = 0)) > 0, 
            TRUE, 
            FALSE
            ) as isReserved;
        `,
      ).then((isReservedArr) => isReservedArr[0].isReserved);
      let dueDate;
      // 대출이 가능한 책들이 비치중이 아닐 경우
      if (eachBook.status === 0 && isLendable === 0) {
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
        ).then((dueDateArr) => (dueDateArr[0]?.dueDate ? dueDateArr[0].dueDate : '-'));
      } else {
        dueDate = '-';
      }
      const { ...rest } = eachBook;
      return {
        ...rest, dueDate, isLendable, isReserved,
      };
    }),
  );
  bookSpec.books = books;
  return bookSpec;
};
