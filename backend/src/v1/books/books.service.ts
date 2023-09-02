/* eslint-disable prefer-regex-literals */
/* eslint-disable prefer-destructuring */
import axios from 'axios';
import jipDataSource from '~/app-data-source';
import { nationalIsbnApiKey, naverBookApiOption } from '~/config';
import { logger } from '~/logger';
import { executeQuery } from '~/mysql';
import * as errorCode from '~/v1/utils/error/errorCode';
import { StringRows } from '~/v1/utils/types';
import { VSearchBookByTag } from '~/entity/entities';
import {
  disassembleHangul,
  extractHangulInitials,
} from '~/v1/utils/disassembleKeywords';
import * as models from './books.model';
import BooksRepository from './books.repository';
import {
  CreateBookInfo, LendingBookList, UpdateBook, UpdateBookInfo,
  categoryIds, UpdateBookDonator,
} from './books.type';
import { categoryWithBookCount } from '../DTO/common.interface';
import { Project, RawProject } from '../DTO/cursus.model';
import UsersRepository from '../users/users.repository';
import ErrorResponse from '../utils/error/errorResponse';
import * as searchKeywordsService from '../search-keywords/searchKeywords.service';
import BookInfoSearchKeywordRepository from '../search-keywords/booksInfoSearchKeywords.repository';

const getInfoInNationalLibrary = async (isbn: string) => {
  let book;
  let searchResult;
  await axios
    .get(`https://www.nl.go.kr/seoji/SearchApi.do?cert_key=${nationalIsbnApiKey}&result_style=json&page_no=1&page_size=10&isbn=${isbn}`)
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
          'X-Naver-Client-Id': `${naverBookApiOption.client}`,
          'X-Naver-Client-Secret': `${naverBookApiOption.secret}`,
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

const getCategoryAlphabet = (categoryId : number): string => {
  try {
    const category = Object.values(categoryIds) as string[];
    return category[categoryId - 1];
  } catch (e) {
    throw new Error(errorCode.INVALID_CATEGORY_ID);
  }
};

export const search = async (
  query: string,
  page: number,
  limit: number,
) => {
  const booksRepository = new BooksRepository();
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

export const createBook = async (book: CreateBookInfo) => {
  const transactionQueryRunner = jipDataSource.createQueryRunner();
  const booksRepository = new BooksRepository(transactionQueryRunner);
  const bookInfoSearchKeywordRepository = new BookInfoSearchKeywordRepository(
    transactionQueryRunner,
  );
  const isbn = book.isbn === undefined ? '' : book.isbn;
  const isbnInBookInfo = await booksRepository.isExistBook(isbn);
  const checkNickName = await booksRepository.checkNickName(book.donator);
  const categoryAlphabet = getCategoryAlphabet(Number(book.categoryId));
  try {
    await transactionQueryRunner.startTransaction();
    let recommendCopyNum = 1;
    let recommendPrimaryNum;

    if (checkNickName > 1) {
      logger.warn(`${errorCode.SLACKID_OVERLAP}: nickname이 중복입니다. 최근에 가입한 user의 ID로 기부가 기록됩니다.`);
    }

    if (isbnInBookInfo === 0) {
      const BookInfo = await booksRepository.createBookInfo(book);
      await bookInfoSearchKeywordRepository.createBookInfoSearchKeyword(BookInfo);
      if (typeof BookInfo.id === 'number') {
        book.infoId = BookInfo.id;
      }
      const categoryId = book.categoryId === undefined ? '' : book.categoryId;
      recommendPrimaryNum = await booksRepository.getNewCallsignPrimaryNum(categoryId);
    } else {
      const bookInfoId = await booksRepository.getBookList(isbn, 1, 0);
      book.infoId = bookInfoId[0].bookInfoId;
      const nums = await booksRepository.getOldCallsignNums(categoryAlphabet);
      recommendPrimaryNum = nums.recommendPrimaryNum;
      recommendCopyNum = nums.recommendCopyNum * 1 + 1;
    }
    const recommendCallSign = `${categoryAlphabet}${recommendPrimaryNum}.${String(book.pubdate).slice(2, 4)}.v1.c${recommendCopyNum}`;
    await booksRepository.createBook({ ...book, callSign: recommendCallSign });
    await transactionQueryRunner.commitTransaction();
    return ({ callsign: recommendCallSign });
  } catch (error) {
    await transactionQueryRunner.rollbackTransaction();
    if (error instanceof Error) {
      throw error;
    }
  } finally {
    await transactionQueryRunner.release();
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
  const booksRepository = new BooksRepository();
  const bookList: LendingBookList[] = await booksRepository.getLendingBookList(sort, limit);
  return { items: bookList };
};

export const searchInfo = async (
  query: string,
  page: number,
  limit: number,
  sort: string,
  category: string,
) => {
  const disassemble = query ? disassembleHangul(query) : '';
  const initials = query ? extractHangulInitials(query) : '';

  let matchScore: string;
  let searchCondition: string;
  if (!query) {
    matchScore = '';
    searchCondition = 'TRUE';
  } else if (query === initials) {
    matchScore = `MATCH(book_info_search_keywords.title_initials,
      book_info_search_keywords.author_initials,
      book_info_search_keywords.publisher_initials)
      AGAINST ('${initials}' IN BOOLEAN MODE)`;
    searchCondition = `${matchScore}
      OR book_info_search_keywords.title_initials LIKE '%${initials}%'
      OR book_info_search_keywords.author_initials LIKE '%${initials}%'
      OR book_info_search_keywords.publisher_initials LIKE '%${initials}%'`;
  } else {
    matchScore = `MATCH(book_info_search_keywords.disassembled_title,
      book_info_search_keywords.disassembled_author,
      book_info_search_keywords.disassembled_publisher)
      AGAINST ('${disassemble}' IN BOOLEAN MODE)`;
    searchCondition = `${matchScore}
      OR book_info_search_keywords.disassembled_title LIKE '%${disassemble}%'
      OR book_info_search_keywords.disassembled_author LIKE '%${disassemble}%'
      OR book_info_search_keywords.disassembled_publisher LIKE '%${disassemble}%'`;
  }

  let ordering: string;
  switch (sort) {
    case 'title':
      ordering = 'ORDER BY book_info.title';
      break;
    case 'popular':
      ordering = 'ORDER BY lendingCnt DESC, book_info.title';
      break;
    case 'new':
      ordering = 'ORDER BY book_info.createdAt DESC, book_info.title';
      break;
    default:
      ordering = matchScore
        ? `ORDER BY ${matchScore} DESC, book_info.title`
        : 'ORDER BY book_info.title';
      break;
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
  const categoryHaving = categoryName ? `category = '${categoryName}'` : 'TRUE';

  const categoryListPromise = executeQuery(
    `
    SELECT name, count FROM (
    SELECT
      IFNULL(category.name, "ALL") AS name,
      count(category.name) AS count
    FROM book_info
    RIGHT JOIN category ON book_info.categoryId = category.id
    LEFT JOIN book_info_search_keywords
      ON book_info.id = book_info_search_keywords.book_info_id
    WHERE (
      book_info.isbn LIKE ?
      OR ${searchCondition}
    )
    GROUP BY category.name WITH ROLLUP) as a
    ORDER BY name ASC;
    `,
    [`%${query}%`],
  ) as Promise<models.categoryCount[]>;

  const bookListPromise = executeQuery(
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
    LEFT JOIN book_info_search_keywords
      ON book_info.id = book_info_search_keywords.book_info_id
    WHERE (
      book_info.isbn LIKE ?
      OR ${searchCondition}
    )
    GROUP BY book_info.id
    HAVING ${categoryHaving}
    ${ordering}
    LIMIT ?
    OFFSET ?;
  `,
    [`%${query}%`, limit, page * limit],
  ) as Promise<models.BookInfo[]>;

  const totalItemsPromise = executeQuery(
    `
    SELECT
      count(category.name) AS count
    FROM book_info
    LEFT JOIN category ON book_info.categoryId = category.id
    LEFT JOIN book_info_search_keywords
      ON book_info.id = book_info_search_keywords.book_info_id
    WHERE (
      book_info.isbn LIKE ?
      OR ${searchCondition}
    ) AND (
      ${categoryWhere}
    )
  `,
    [`%${query}%`],
  ).then((result) => result[0].count) as Promise<number>;

  const [categoryList, bookList, totalItems] = await Promise.all([
    categoryListPromise,
    bookListPromise,
    totalItemsPromise,
    searchKeywordsService.createSearchKeywordLog(query, disassemble, initials),
  ]);

  const meta = {
    totalItems,
    itemCount: bookList.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page + 1,
  };

  return { items: bookList, categories: categoryList, meta };
};

export const searchInfoByTag = async (
  query: string,
  page: number,
  limit: number,
  sort: string,
  category: string,
) => {
  const booksRepository = new BooksRepository();
  let sortQuery = {};
  switch (sort) {
    case 'title':
      sortQuery = { title: 'ASC' };
      break;
    case 'popular':
      sortQuery = { lendingCnt: 'DESC' };
      break;
    default:
      sortQuery = { createdAt: 'DESC' };
  }
  const whereQuery: Array<object> = [
    { superTagContent: query },
    { subTagContent: query },
  ];
  if (category) {
    whereQuery.push({ category });
  }
  const [rawBookList, count] = await booksRepository.getBookListByTag(
    whereQuery,
    page,
    limit,
    sortQuery,
  );
  const bookList: Array<VSearchBookByTag> = new Array<VSearchBookByTag>();
  const categoryList: Array<categoryWithBookCount> = new Array<categoryWithBookCount>();
  rawBookList.forEach((book) => {
    bookList.push({ ...book, lendingCnt: Number(book.lendingCnt) });
    const index = categoryList.findIndex((item) => item.name === book.category);
    if (index === -1) {
      categoryList.push({ name: book.category, bookCount: 1 });
    } else {
      categoryList[index].bookCount += 1;
    }
  });
  const meta = {
    totalItems: count,
    itemCount: bookList.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(bookList.length / limit),
    currentPage: page + 1,
  };
  return { items: bookList, categories: categoryList, meta };
};

export const getBookById = async (id: string) => {
  const booksRepository = new BooksRepository();
  const book = await booksRepository.findOneBookById(id);
  const ret = {
    id: book?.bookId,
    ...book,
  };

  return ret;
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

export const updateBookInfo = async (bookInfo: UpdateBookInfo) => {
  const booksRepository = new BooksRepository();
  await booksRepository.updateBookInfo(bookInfo);
};

export const updateBook = async (book: UpdateBook) => {
  const booksRepository = new BooksRepository();
  await booksRepository.updateBook(book);
};

export const updateBookDonator = async (bookDonator: UpdateBookDonator) => {
  const booksRepository = new BooksRepository();
  await booksRepository.updateBookDonator(bookDonator);
};

export const getIntraId = async (
  login: string,
): Promise<string> => {
  const usersRepo = new UsersRepository();
  const user = (await usersRepo.searchUserBy({ nickname: login }, 1, 0))[0];
  return user[0].intraId.toString();
};

export const getUserProjectFrom42API = async (
  accessToken: string,
  userId: string,
): Promise<Project[]> => {
  const projectURL = `https://api.intra.42.fr/v2/users/${userId}/projects_users`;
  const userProject: Array<Project> = [];
  await axios(projectURL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => {
    const rawData: RawProject[] = response.data;
    rawData.forEach((data: RawProject) => {
      userProject.push({
        id: data.id,
        status: data.status,
        validated: data['validated?'],
        project: data.project,
        cursus_ids: data.cursus_ids,
        marked: data.marked,
        marked_at: data.marked_at,
      });
    });
  }).catch((error) => {
    if (error.response.status === 401) {
      throw new ErrorResponse(errorCode.NO_TOKEN, 401);
    } else {
      throw new ErrorResponse(errorCode.UNKNOWN_ERROR, 500);
    }
  });
  return userProject;
};
