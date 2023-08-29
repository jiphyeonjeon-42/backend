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
import fs from 'fs';
import path from 'path';
import * as models from './books.model';
import BooksRepository from './books.repository';
import {
  CreateBookInfo, LendingBookList, UpdateBook, UpdateBookInfo,
  categoryIds, UpdateBookDonator,
} from './books.type';
import { categoryWithBookCount } from '../DTO/common.interface';
import {
  BookListWithSubject,
  BooksWithProjectInfo, Cursus, Project, ProjectFrom42, ProjectInfo, ProjectWithCircle, RawProject,
} from '../DTO/cursus.model';
import UsersRepository from '../users/users.repository';
import ErrorResponse from '../utils/error/errorResponse';

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
        updated_at: data.updated_at,
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

/**
 * cursus 객체에서 projectId가 포함된 서클 번호를 찾는 함수.
 * Inner circle은 0 부터 6까지이며, Outer circle은 null이다.
 * @param cursus 키가 서클 번호, 값이 프로젝트 id 배열인 객체
 * @param projectId 프로젝트 id
 * @returns projectId가 포함된 서클 번호 문자열
 */
const findCircle = (
  cursus: ProjectWithCircle,
  projectId: number,
) => {
  let circle: string | null = null;
  Object.keys(cursus).forEach((key) => {
    const projectIds = cursus[key].project_ids;
    if (projectIds.includes(projectId)) {
      circle = key;
      return true; // 순회 중단
    }
    return false;
  });
  return circle;
};

/**
 * 아우터 서클에 있는 프로젝트 id 배열을 반환하는 함수.
 * 사용자가 진행한 프로젝
 * @param cursus 서클 번호를 키로, 프로젝트 id 배열을 값으로 갖는 객체
 * @param projectList 사용자가 진행한 프로젝트 목록
 * @returns 아우터 서클에 있는 프로젝트 id 배열
 */
const getOuterProjectIds = (
  cursus: ProjectWithCircle,
  projectList: Project[] | null,
) => {
  const filePath = path.join(__dirname, '../../assets', 'projects_info.json');
  const project42: ProjectInfo[] = JSON.parse(fs.readFileSync(path.join(filePath), { encoding: 'utf8', flag: 'r' }));
  let outerProjectIds: number[] = [];
  for (let i = 0; i < project42.length; i += 1) {
    const projectId = project42[i].id;
    const circle = findCircle(cursus, projectId);
    if (circle === null) {
      outerProjectIds.push(project42[i].id);
    }
  }
  if (projectList) {
    const projectIds = projectList.map((project) => project.project.id);
    outerProjectIds = outerProjectIds.filter((id) => !projectIds.includes(id));
  }
  return outerProjectIds;
};

/**
 * 추천할 프로젝트 id 배열을 반환하는 함수. 만약 현재 서클 내에 추천할 프로젝트가 없다면 다음 서클에서 추천할 프로젝트를 반환한다.
 * @param cursus 키가 서클 번호, 값이 프로젝트 id 배열인 객체
 * @param circle 서클 번호
 * @returns 추천할 프로젝트 id 배열
 */
const getNextProjectIds = (
  cursus: ProjectWithCircle,
  circle: string,
) => {
  const projectIds = cursus[circle].project_ids;
  let innerProjectIds = projectIds.filter((id) => id !== 0);
  if (innerProjectIds.length === 0) {
    const nextCircle = Number(circle) + 1;
    if (nextCircle > 6) {
      innerProjectIds = getOuterProjectIds(cursus, null);
    }
    innerProjectIds = cursus[nextCircle].project_ids;
  }
  return innerProjectIds;
};

/**
 *
 * @param userProject 사용자의 프로젝트 정보
 * @returns 사용자에게 추천할 프로젝트
 */
export const getRecommendedProject = async (
  userProject: Project[],
) => {
  const projectList = userProject.sort((prev, post) =>
    new Date(post.updated_at).getTime() - new Date(prev.updated_at).getTime())
    .filter((item: Project) => !item.project.name.includes('Exam Rank'));
  const recommendedProject = projectList.filter((project) =>
    project.status === 'in_progress');
  if (recommendedProject.length > 0) {
    return recommendedProject.map((project) => project.project.id);
  }
  // 최근에 진행한 프로젝트를 바탕으로 추천할 프로젝트를 찾는다.
  const filePath: string = path.join(__dirname, '../../assets', 'cursus_info.json');
  const cursus: ProjectWithCircle = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  const userProjectId = userProject[0].project.id;
  const circle: string | null = findCircle(cursus, userProjectId);
  let nextProjectIds: number[] = [];
  if (circle) { // Inner Circle
    nextProjectIds = getNextProjectIds(cursus, circle);
  } else { // Outer Circle
    nextProjectIds = getOuterProjectIds(cursus, projectList);
  }
  return nextProjectIds;
};

/**
 * books_with_project_info.json 파일에서 추천할 책 id 배열을 반환하는 함수.
 * @param projectIds 추천할 프로젝트 id 배열
 * @returns 추천할 책 id 배열
 */
export const getRecommendedBookIds = async (
  projectIds: number[],
) => {
  let filePath = path.join(__dirname, '../../assets', 'books_with_project_info.json');
  const booksWithCursusInfo: BooksWithProjectInfo[] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  filePath = path.join(__dirname, '../../assets', 'cursus_info.json');
  const recommendedBookIds: number[] = [];
  for (let i = 0; i < booksWithCursusInfo.length; i += 1) {
    const { projects } = booksWithCursusInfo[i];
    for (let j = 0; j < projects.length; j += 1) {
      const { id } = projects[j];
      if (projectIds.includes(id)) {
        recommendedBookIds.push(booksWithCursusInfo[i].book_info_id);
      }
    }
  }
  recommendedBookIds.filter(( // 중복 제거
    bookInfoId,
    index,
  ) => recommendedBookIds.indexOf(bookInfoId) === index);
  return recommendedBookIds;
};

/**
 * 추천 도서의 기존 book_info 정보에 프로젝트 정보를 추가하여 반환하는 함수.
 * @param bookInfoIds 추천 도서의 id 배열
 * @param limit 추천 도서의 개수
 * @returns 추천 도서의 정보
 */
export const getBookListByIds = async (
  bookInfoIds: number[],
  limit: number,
) => {
  const booksRepository = new BooksRepository();
  const bookList = await booksRepository.findBooksByIds(bookInfoIds);
  const bookListWithProject: BookListWithSubject[] = [];
  let filePath = path.join(__dirname, '../../assets', 'books_with_project_info.json');
  const booksWithCursusInfo: BooksWithProjectInfo[] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  filePath = path.join(__dirname, '../../assets', 'projects_info.json');
  const projectInfo: ProjectInfo[] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  for (let i = 0; i < bookList.length; i += 1) {
    const { id } = bookList[i];
    const projectId = booksWithCursusInfo.find((book) => book.book_info_id === id)?.projects[0].id;
    if (projectId) {
      const project = projectInfo.find((item) => item.id === projectId);
      if (project) {
        const { name } = project;
        bookListWithProject.push({ ...bookList[i], project: [name] });
      }
    }
  }
  return bookListWithProject.slice(0, limit);
};

/**
 * books_with_project_info.json 파일에 저장된 추천 도서의 프로젝트 정보를 반환하는 함수.
 * @returns 추천 도서의 프로젝트 정보
 */
export const getRecommendMeta = async () => {
  let filePath: string = path.join(__dirname, '../../assets', 'books_with_project_info.json');
  const booksWithProjectInfo: BooksWithProjectInfo[] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  filePath = path.join(__dirname, '../../assets', 'projects_info.json');
  const cursus: ProjectInfo[] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  const meta: string[] = [];
  for (let i = 0; i < booksWithProjectInfo.length; i += 1) {
    const { projects } = booksWithProjectInfo[i];
    for (let j = 0; j < projects.length; j += 1) {
      let projectName = cursus.find((project) => project.id === projects[j].id)?.name;
      if (projectName === undefined) {
        projectName = '기타';
      }
      let circle = projects[j].circle.toString();
      if (circle === '-1') { circle = '아우터 '; }
      meta.push(`${circle}서클 | ${projectName}`);
    }
  }
  return [...new Set(meta)];
};
