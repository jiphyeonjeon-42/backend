import { match } from 'ts-pattern';
import {
  searchBookListAndCount,
  vSearchBookRepo,
  updateBookById,
  updateBookInfoById,
  searchBookInfoSpecById,
  searchBooksByInfoId,
  getIsLendable,
  getIsReserved,
  getDuedate,
  getBookInfosSorted,
  getBookInfosByTag,
  userRepo,
  updateBookDonatorName,
} from './repository';
import { BookInfoNotFoundError, Meta, BookNotFoundError } from '../shared';
import { IsbnNotFoundError, NaverBookNotFound, PubdateFormatError } from './errors';
import { dateNow, dateSubDays } from '~/kysely/sqlDates';
import axios from 'axios';
import { nationalIsbnApiKey, naverBookApiOption } from '~/config';

type CategoryList = { name: string; count: number };
type SearchBookInfosByTag = {
  query: string;
  sort: string;
  page: number;
  limit: number;
  category?: string | undefined;
};
export const searchBookInfosByTag = async ({
  query,
  sort,
  page,
  limit,
  category,
}: SearchBookInfosByTag) => {
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

  let whereQuery: Array<object> = [{ superTagContent: query }, { subTagContent: query }];

  if (category) {
    whereQuery.push({ category });
  }

  const [bookInfoList, totalItems] = await getBookInfosByTag(whereQuery, sortQuery, page, limit);
  let categoryList = new Array<CategoryList>();
  bookInfoList.forEach((bookInfo) => {
    const index = categoryList.findIndex((item) => bookInfo.category === item.name);
    if (index === -1) categoryList.push({ name: bookInfo.category, count: 1 });
    else categoryList[index].count += 1;
  });
  const meta = {
    totalItems,
    itemCount: bookInfoList.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(bookInfoList.length / limit),
    currentPage: page + 1,
  };

  return {
    items: bookInfoList,
    categories: categoryList,
    meta,
  };
};

type SearchBookInfosSortedArgs = { sort: string; limit: number };
export const searchBookInfosSorted = async ({ sort, limit }: SearchBookInfosSortedArgs) => {
  let items;
  if (sort === 'popular') {
    items = await getBookInfosSorted(limit)
      .where('lending.createdAt', '>=', dateSubDays(dateNow(), 42))
      .orderBy('lendingCnt', 'desc')
      .orderBy('title', 'asc')
      .execute();
  } else {
    items = await getBookInfosSorted(limit)
      .orderBy('createdAt', 'desc')
      .orderBy('title', 'asc')
      .execute();
  }

  return { items } as const;
};

export const searchBookInfoById = async (id: number) => {
  let bookSpec = await searchBookInfoSpecById(id);

  if (bookSpec === undefined) return new BookInfoNotFoundError(id);

  if (bookSpec.publishedAt) {
    const date = new Date(bookSpec.publishedAt);
    bookSpec.publishedAt = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  }

  const eachbooks = await searchBooksByInfoId(id);

  const books = await Promise.all(
    eachbooks.map(async (eachBook) => {
      const isLendable = await getIsLendable(eachBook.id);
      const isReserved = await getIsReserved(eachBook.id);
      let dueDate;

      if (eachBook.status === 0 && isLendable === false) {
        dueDate = await getDuedate(eachBook.id);
        dueDate = dueDate?.dueDate;
      } else dueDate = '-';

      return {
        ...eachBook,
        dueDate,
        isLendable,
        isReserved,
      };
    }),
  );

  return {
    ...bookSpec,
    books,
  };
};

type SearchAllBooksArgs = { query?: string | undefined; page: number; limit: number };
export const searchAllBooks = async ({ query, page, limit }: SearchAllBooksArgs) => {
  const [BookList, totalItems] = await searchBookListAndCount({
    query: query ? query : '',
    page,
    limit,
  });

  const meta: Meta = {
    totalItems,
    itemCount: BookList.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page + 1,
  };
  return { items: BookList, meta };
};

type BookInfoForCreate = {
  title: string;
  author?: string | undefined;
  isbn: string;
  category: string;
  publisher: string;
  pubdate: string;
  image: string;
};
const getInfoInNationalLibrary = async (isbn: string) => {
  let bookInfo: BookInfoForCreate | undefined;
  let searchResult;

  await axios
    .get(
      `https://www.nl.go.kr/seoji/SearchApi.do?cert_key=${nationalIsbnApiKey}&result_style=json&page_no=1&page_size=10&isbn=${isbn}`,
    )
    .then((res) => {
      searchResult = res.data.docs[0];
      const {
        TITLE: title,
        SUBJECT: category,
        PUBLISHER: publisher,
        PUBLISH_PREDATE: pubdate,
      } = searchResult;
      const image = `https://image.kyobobook.co.kr/images/book/xlarge/${isbn.slice(
        -3,
      )}/x${isbn}.jpg`;
      bookInfo = {
        title,
        image,
        category,
        isbn,
        publisher,
        pubdate,
      };
    })
    .catch(() => {
      console.log('Error');
    });
  return bookInfo;
};

const getAuthorInNaver = async (isbn: string) => {
  let author;

  await axios
    .get(`https://openapi.naver.com/v1/search/book_adv?d_isbn=${isbn}`, {
      headers: {
        'X-Naver-Client-Id': `${naverBookApiOption.client}`,
        'X-Naver-Client-Secret': `${naverBookApiOption.secret}`,
      },
    })
    .then((res) => {
      author = res.data.items[0].author;
    })
    .catch(() => {
      console.log('ERROR');
    });
  return author;
};

export const searchBookInfoForCreate = async (isbn: string) => {
  let bookInfo = await getInfoInNationalLibrary(isbn);
  if (bookInfo === undefined) return new IsbnNotFoundError(isbn);

  bookInfo.author = await getAuthorInNaver(isbn);
  if (bookInfo.author === undefined) return new NaverBookNotFound(isbn);

  return { bookInfo };
};

type SearchBookByIdArgs = { id: number };
export const searchBookById = async ({ id }: SearchBookByIdArgs) => {
  const book = await vSearchBookRepo.findOneBy({ bookId: id });

  return match(book)
    .with(null, () => new BookNotFoundError(id))
    .otherwise(() => {
      return {
        id: book?.bookId,
        ...book,
      };
    });
};

type UpdateBookArgs = {
  bookId: number;
  callSign?: string | undefined;
  status?: number | undefined;
};
const updateBook = async (book: UpdateBookArgs) => {
  return await updateBookById({ id: book.bookId, callSign: book.callSign, status: book.status });
};

type UpdateBookInfoArgs = {
  bookInfoId: number;
  title?: string | undefined;
  author?: string | undefined;
  publisher?: string | undefined;
  publishedAt?: string | undefined;
  image?: string | undefined;
  categoryId?: number | undefined;
};
const pubdateFormatValidator = (pubdate: string) => {
  const regexCondition = /^[0-9]{8}$/;
  return regexCondition.test(pubdate);
};
const updateBookInfo = async (book: UpdateBookInfoArgs) => {
  if (book.publishedAt && !pubdateFormatValidator(book.publishedAt))
    return new PubdateFormatError(book.publishedAt);
  return await updateBookInfoById({
    id: book.bookInfoId,
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    publishedAt: book.publishedAt,
    image: book.image,
    categoryId: book.categoryId,
  });
};

type UpdateBookOrBookInfoArgs = Omit<UpdateBookArgs, 'bookId'> &
  Omit<UpdateBookInfoArgs, 'bookInfoId'> & {
    bookId?: number | undefined;
    bookInfoId?: number | undefined;
  };
export const updateBookOrBookInfo = async (book: UpdateBookOrBookInfoArgs) => {
  if (book.bookId)
    await updateBook({
      bookId: book.bookId,
      callSign: book.callSign,
      status: book.status,
    });
  if (book.bookInfoId)
    return await updateBookInfo({
      bookInfoId: book.bookInfoId,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      publishedAt: book.publishedAt,
      image: book.image,
      categoryId: book.categoryId,
    });
};

type UpdateBookDonatorArgs = { bookId: number; nickname: string };
export const updateBookDonator = async ({ bookId, nickname }: UpdateBookDonatorArgs) => {
  const user = await userRepo.findOneBy({ nickname });
  return await updateBookDonatorName({
    bookId,
    donator: nickname,
    donatorId: user ? user.id : null,
  });
};
