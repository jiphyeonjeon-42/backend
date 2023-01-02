/* eslint-disable prefer-regex-literals */
/* eslint-disable prefer-destructuring */
import axios from 'axios';
import { executeQuery, makeExecuteQuery, pool } from '../mysql';
import { StringRows } from '../utils/types';
import * as models from './books.model';
import * as types from './books.type';
import * as errorCode from '../utils/error/errorCode';
import { logger } from '../utils/logger';
const booksRepository = require('./books.repository')

export const search = async (
  query: string,
  page: number,
  limit: number,
) => {
  // const bookList = (await executeQuery(
  //   `
  //   SELECT
  //     book_info.id AS bookInfoId,
  //     book_info.title AS title,
  //     book_info.author AS author,
  //     book_info.publisher AS publisher,
  //     DATE_FORMAT(book_info.publishedAt, '%Y%m%d') AS publishedAt,
  //     book_info.isbn AS isbn,
  //     book.callSign AS callSign,
  //     book_info.image AS image,
  //     book.id AS bookId,
  //     book.status AS status,
  //     book_info.categoryId AS categoryId,
  //     (
  //       SELECT name
  //       FROM category
  //       WHERE id = book_info.categoryId
  //     ) AS category,
  //     (
  //       IF((
  //           IF((select COUNT(*) from lending as l where l.bookId = book.id and l.returnedAt is NULL) = 0, TRUE, FALSE)
  //           AND
  //           IF((select COUNT(*) from book as b where (b.id = book.id and b.status = 0)) = 1, TRUE, FALSE)
  //           AND
  //           IF((select COUNT(*) from reservation as r where (r.bookId = book.id and status = 0)) = 0, TRUE, FALSE)
  //           ), TRUE, FALSE)
  //     ) AS isLendable
  //   FROM book_info, book
  //   WHERE book_info.id = book.infoId AND
  //   (book_info.title like ?
  //     OR book_info.author like ?
  //     OR book_info.isbn like ?)
  //   LIMIT ?
  //   OFFSET ?;
  // `,
  //   [`%${query}%`, `%${query}%`, `%${query}%`, limit, page * limit],
  // )) as models.BookInfo[];
  const bookList = await booksRepository.getBookList(query, limit, page);
  const totalItems = await booksRepository.getTotalItems(query);
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
        TITLE: title, SUBJECT: category, PUBLISHER: publisher, PUBLISH_PREDATE: pubdate,
      } = searchResult;
      const image = `https://image.kyobobook.co.kr/images/book/xlarge/${isbn.slice(-3)}/x${isbn}.jpg`;
      book = {
        title, image, category, isbn, publisher, pubdate,
      };
    })
    .catch(() => {
      throw new Error(errorCode.ISBN_SEARCH_FAILED);
    });
  return (book);
};

const getAuthorInNaver = async (isbn: string) => {
  let author;
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
      author = res.data.items[0].author;
    })
    .catch(() => {
      throw new Error(errorCode.ISBN_SEARCH_FAILED_IN_NAVER);
    });
  return (author);
};

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
      return 'g';
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
      throw new Error(errorCode.INVALID_CATEGORY_ID);
  }
};

export const createBook = async (book: types.CreateBookInfo) => {
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  try {
    await conn.beginTransaction();
    let recommendCopyNum;
    let recommendPrimaryNum;
    let categoryAlpabet;

    const isbnInBookInfo = (await transactionExecuteQuery('SELECT COUNT(*) as cnt, isbn FROM book_info WHERE isbn = ?', [book.isbn])) as StringRows[];
    const slackIdExist = (await transactionExecuteQuery('SELECT COUNT(*) as cnt FROM user WHERE nickname = ?', [book.donator])) as StringRows[];
    if (slackIdExist[0].cnt > 1) {
      logger.warn(`${errorCode.SLACKID_OVERLAP}: nickname이 중복입니다. 최근에 가입한 user의 ID로 기부가 기록됩니다.`);
    }

    const category = (await transactionExecuteQuery(`SELECT name FROM category WHERE id = ${book.categoryId}`))[0].name;

    if (isbnInBookInfo[0].cnt === 0) {
      await transactionExecuteQuery(
        `INSERT INTO book_info (title, author, publisher, isbn, image, categoryId, publishedAt)
      VALUES (?, ?, ?, (SELECT IF (? != 'NOTEXIST', ?, NULL)), (SELECT IF (? != 'NOTEXIST', ?, NULL)), ?, ?)`,
        [
          book.title,
          book.author,
          book.publisher,
          book.isbn ? book.isbn : 'NOTEXIST',
          book.isbn ? book.isbn : 'NOTEXIST',
          book.image ? book.image : 'NOTEXIST',
          book.image ? book.image : 'NOTEXIST',
          book.categoryId,
          book.pubdate,
        ],
      );
      categoryAlpabet = getCategoryAlpabet(Number(book.categoryId));
      recommendPrimaryNum = (await transactionExecuteQuery('SELECT COUNT(*) + 1 as recommendPrimaryNum FROM book_info where categoryId = ?', [book.categoryId]))[0].recommendPrimaryNum;
      recommendCopyNum = 1;
    } else {
      categoryAlpabet = (await transactionExecuteQuery('SELECT substring(callsign,1,1) as categoryAlpabet FROM book WHERE infoId = (select id from book_info where isbn = ? limit 1)', [book.isbn]))[0].categoryAlpabet;
      recommendPrimaryNum = (await transactionExecuteQuery('SELECT substring(substring_index(callsign, ".", 1),2) as recommendPrimaryNum FROM book WHERE infoId = (select id from book_info where isbn = ? limit 1)', [book.isbn]))[0].recommendPrimaryNum;
      recommendCopyNum = (await transactionExecuteQuery('SELECT MAX(convert(substring(substring_index(callsign, ".", -1),2), unsigned)) + 1 as recommendCopyNum FROM book WHERE infoId = (select id from book_info where isbn = ? limit 1)', [book.isbn]))[0].recommendCopyNum;
    }
    const recommendCallSign = `${categoryAlpabet}${recommendPrimaryNum}.${String(book.pubdate).slice(2, 4)}.v1.c${recommendCopyNum}`;
    await transactionExecuteQuery(`INSERT INTO book (donator, donatorId, callSign, status, infoId) VALUES
    ((SELECT IF (? != 'NOTEXIST', ?, NULL)),(SELECT id FROM user WHERE nickname = ? ORDER BY createdAt DESC LIMIT 1),?,0,(SELECT id FROM book_info WHERE (isbn = ? or title = ?) ORDER BY createdAt DESC LIMIT 1))
  `, [book.donator ? book.donator : 'NOTEXIST',
      book.donator ? book.donator : 'NOTEXIST',
      book.donator,
      recommendCallSign,
      book.isbn,
      book.title]);
    await conn.commit();
    return ({ callsign: recommendCallSign });
  } catch (error) {
    await conn.rollback();
    if (error instanceof Error) {
      throw error;
    }
  } finally {
    conn.release();
  }
  return (new Error(errorCode.FAIL_CREATE_BOOK_BY_UNEXPECTED));
};

export const createBookInfo = async (isbn: string) => {
  const bookInfo: any = await getInfoInNationalLibrary(isbn);
  bookInfo.author = await getAuthorInNaver(isbn);
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
  let lendingCntCondition = '';
  switch (sort) {
    case 'popular':
      lendingCntCondition = 'and lending.createdAt >= date_sub(now(), interval 42 day)';
      break;
    default:
      lendingCntCondition = '';
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
    ${lendingCntCondition}
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
    SELECT name, count FROM (
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
    GROUP BY category.name WITH ROLLUP) as a
    ORDER BY name ASC;
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

export const createLike = async (userId: number, bookInfoId: number) => {
  // bookInfo 유효검증
  const numberOfBookInfo = await executeQuery(`
  SELECT COUNT(*) as count
  FROM book_info
  WHERE id = ?;
  `, [bookInfoId]);
  if (numberOfBookInfo.count === 0) { throw new Error(errorCode.INVALID_INFO_ID_LIKES); }
  // 중복 like 검증
  const LikeArray = await executeQuery(`
  SELECT id, isDeleted
  FROM likes
  WHERE userId = ? AND bookInfoId = ?;
  `, [userId, bookInfoId]);
  if (LikeArray.length !== 0 && LikeArray[0].isDeleted === 0) { throw new Error(errorCode.ALREADY_LIKES); }
  // create
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  conn.beginTransaction();
  try {
    if (LikeArray.length === 0) {
      // 새로운 튜플 생성
      await transactionExecuteQuery(`
        INSERT INTO likes(
          userId,
          bookInfoId,
          isDeleted
        )VALUES (?, ?, ?)
      `, [userId, bookInfoId, false]);
    } else {
      // 삭제된 튜플 복구
      await transactionExecuteQuery(`
        UPDATE likes
        SET
          isDeleted = ?
        WHERE userId = ? AND bookInfoId = ?
      `, [false, userId, bookInfoId]);
    }
    conn.commit();
  } catch (error) {
    conn.rollback();
  } finally {
    conn.release();
  }
  return { userId, bookInfoId };
};

export const deleteLike = async (userId: number, bookInfoId: number) => {
  // bookInfo 유효검증
  const numberOfBookInfo = await executeQuery(`
  SELECT COUNT(*) as count
  FROM book_info
  WHERE id = ?;
  `, [bookInfoId]);
  if (numberOfBookInfo[0].count === 0) { throw new Error(errorCode.INVALID_INFO_ID_LIKES); }
  // like 존재여부 검증
  const LikeArray = await executeQuery(`
  SELECT id, isDeleted
  FROM likes
  WHERE userId = ? AND bookInfoId = ?;
  `, [userId, bookInfoId]);
  if (LikeArray.length === 0) { throw new Error(errorCode.NONEXISTENT_LIKES); }
  // delete
  const conn = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(conn);
  conn.beginTransaction();
  try {
    // 튜플 상태값을 수정하는 soft delete
    await transactionExecuteQuery(`
      UPDATE likes
      SET
        isDeleted = ?
      WHERE id = ?
    `, [true, LikeArray[0].id]);
    conn.commit();
  } catch (error) {
    conn.rollback();
  } finally {
    conn.release();
  }
};

export const getLikeInfo = async (userId: number, bookInfoId: number) => {
  // bookInfo 유효검증
  const numberOfBookInfo = await executeQuery(`
  SELECT COUNT(*) as count
  FROM book_info
  WHERE id = ?;
  `, [bookInfoId]);
  if (numberOfBookInfo[0].count === 0) { throw new Error(errorCode.INVALID_INFO_ID_LIKES); }
  // (userId, bookInfoId)인 like 데이터 확인
  const LikeArray = await executeQuery(`
  SELECT userId, isDeleted
  FROM likes
  WHERE bookInfoId = ?;
  `, [bookInfoId]);
  let isLiked = false;
  LikeArray.forEach((like: any) => {
    if (like.userId === userId && like.isDeleted === 0) { isLiked = true; }
  });
  const noDeletedLikes = LikeArray.filter((like : any) => like.isDeleted === 0);
  return ({ bookInfoId, isLiked, likeNum: noDeletedLikes.length });
};

export const updateBookInfo = async (bookInfo: types.UpdateBookInfo, book: types.UpdateBook, bookInfoId: number, bookId: number) => {
  let updateBookInfoString = '';
  let updateBookString = '';
  const queryBookInfoParam = [];
  const queryBookParam = [];
  const bookInfoObject: any = {
  } = bookInfo;
  const bookObject: any = {
  } = book;

  for (const key in bookInfoObject) {
    const value = bookInfoObject[key];
    if (key === 'id') {
    } else if (key !== '') {
      updateBookInfoString += `${key} = ?,`;
      queryBookInfoParam.push(value);
    } else if (key === null) {
      updateBookInfoString += `${key} = NULL,`;
    }
  }

  for (const key in bookObject) {
    const value = bookObject[key];
    if (key === 'id') {
    } else if (key !== '') {
      updateBookString += `${key} = ?,`;
      queryBookParam.push(value);
    } else if (key === null) {
      updateBookString += `${key} = NULL,`;
    }
  }

  updateBookInfoString = updateBookInfoString.slice(0, -1);
  updateBookString = updateBookString.slice(0, -1);

  await executeQuery(`
    UPDATE book_info
    SET
    ${updateBookInfoString}
    WHERE id = ${bookInfoId}
    `, queryBookInfoParam);

  await executeQuery(`
    UPDATE book
    SET
    ${updateBookString}
    WHERE id = ${bookId} ;
    `, queryBookParam);
};
