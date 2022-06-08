import axios from 'axios';
import { executeQuery } from '../mysql';
import { StringRows } from '../utils/types';
import * as models from './books.model';
import * as types from './books.type';

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
      (
        SELECT name
        FROM category
        WHERE id = book_info.categoryId
      ) AS category,
      (
        IF ((
          (select COUNT(*) from lending where (bookId = book.id and returnedAt is NULL) = 0)
          and 
          (select COUNT(*) from book where (id = book.id and status = 0) = 1) 
          and
          (select COUNT(*) from reservation where (bookId = book.id and status = 0) = 0)
      ),TRUE,FALSE)
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

  const totalItems = bookList.length;
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
    })
    .catch(() => {
      throw new Error('303');
    });
  return (book);
};

export const createBook = async (book: types.CreateBookInfo) => {
  const {
    isbn, categoryId, donator, callSign,
  } = book;
  if (!(isbn && categoryId && donator && callSign)) {
    throw new Error('300');
  }
  const isbnInBookInfo = (await executeQuery(
    `
    SELECT
      isbn
    FROM book_info
    WHERE isbn = ?
  `,
    [book.isbn],
  )) as StringRows[];

  const searchBySlackID = (await executeQuery(
    `
    SELECT
      id
    FROM user
    WHERE nickname = ?
  `,
    [book.donator],
  )) as StringRows[];

  if (searchBySlackID.length > 1) {
    throw new Error('301');
  }

  const isbnData : any = await searchByIsbn(book.isbn);
  if (isbnData === undefined) {
    throw new Error('302');
  }
  const {
    title, author, publisher, pubdate,
  } = isbnData;
  const image = `https://image.kyobobook.co.kr/images/book/xlarge/${book.isbn.slice(-3)}/x${book.isbn}.jpg`;
  // 이미지는 네이버 api 보다 교보문고가 화질이 더 좋음.
  const category = (await executeQuery(`SELECT name FROM category WHERE id = ${book.categoryId}`))[0].name;

  if (isbnInBookInfo.length === 0) {
    await executeQuery(
      `
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
    )`,
      [
        title,
        author,
        publisher,
        book.isbn,
        image,
        category,
        pubdate,
      ],
    );
  }

  await executeQuery(
    `
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
        WHERE nickname = ?
      ),
      ?,
      0,
      (
        SELECT id
        FROM book_info
        WHERE isbn = ?
      )
    )
  `,
    [
      book.donator,
      book.donator,
      book.callSign,
      book.isbn,
    ],
  );
  return ({ code: 200, message: 'DB에 insert 성공하였습니다.' });
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

export const sortInfo = async (sort: string, limit: number) => {
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
    FROM book_info, lending
    WHERE book_info.id = lending.bookId
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
  const categoryWhere = categoryName
    ? `category.name = '${categoryName}'`
    : 'TRUE';
  const categoryList = (await executeQuery(
    `
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

  const totalItems = categoryList.reduce((prev, curr) => prev + curr.count, 0);
  const meta = {
    totalItems,
    itemCount: bookList.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page + 1,
  };
  return { items: bookList, categories: categoryList, meta };
};

export const getInfo = async (id: number) => {
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
    throw new Error('304');
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
          IF ((
          (select COUNT(*) from lending where (bookId = ${eachBook.id} and returnedAt is NULL) = 0)
          and 
          (select COUNT(*) from book where (id = ${eachBook.id} and status = 0) = 1) 
          and
          (select COUNT(*) from reservation where (bookId = ${eachBook.id} and status = 0) = 0)),
          TRUE,FALSE)
          ) as isLendable`,
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
