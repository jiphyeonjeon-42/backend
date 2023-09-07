import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import {
  searchAllBooks,
  searchBookById,
  searchBookInfoById,
  searchBookInfoForCreate,
  searchBookInfosByTag,
  searchBookInfosSorted,
  updateBookDonator,
  updateBookOrBookInfo,
} from './service';
import {
  BookInfoNotFoundError,
  BookNotFoundError,
  bookInfoNotFound,
  bookNotFound,
  isbnNotFound,
  naverBookNotFound,
  pubdateFormatError,
} from '../shared';
import { IsbnNotFoundError, NaverBookNotFound, PubdateFormatError } from './errors';
import authValidate from '~/v1/auth/auth.validate';
import { roleSet } from '~/v1/auth/auth.type';

const s = initServer();
export const books = s.router(contract.books, {
  // searchAllBookInfos: async ({ query }) => {
  // 	const result = await searchAllBookInfos(query);

  // 	return { status: 200, body: result } as const;
  // },
  // @ts-expect-error
  searchBookInfosByTag: async ({ query }) => {
    const result = await searchBookInfosByTag(query);

    return { status: 200, body: result } as const;
  },
  // @ts-expect-error
  searchBookInfosSorted: async ({ query }) => {
    const result = await searchBookInfosSorted(query);

    return { status: 200, body: result } as const;
  },
  // @ts-expect-error
  searchBookInfoById: async ({ params: { id } }) => {
    const result = await searchBookInfoById(id);

    if (result instanceof BookInfoNotFoundError) return bookInfoNotFound;

    return { status: 200, body: result } as const;
  },
  // @ts-expect-error
  searchAllBooks: async ({ query }) => {
    const result = await searchAllBooks(query);

    return { status: 200, body: result } as const;
  },
  searchBookInfoForCreate: {
    // middleware: [authValidate(roleSet.librarian)],
    // @ts-expect-error
    handler: async ({ query: { isbnQuery } }) => {
      const result = await searchBookInfoForCreate(isbnQuery);

      if (result instanceof IsbnNotFoundError) return isbnNotFound;

      if (result instanceof NaverBookNotFound) return naverBookNotFound;

      return { status: 200, body: result } as const;
    },
  },
  // @ts-expect-error
  searchBookById: async ({ params: { id } }) => {
    const result = await searchBookById({ id });

    if (result instanceof BookNotFoundError) {
      return bookNotFound;
    }

    return {
      status: 200,
      body: result,
    } as const;
  },
  // createBook: {
  // 	middleware: [authValidate(roleSet.librarian)],
  // 	handler: async ({ body }) => {

  // 	}
  // },
  updateBook: {
    // middleware: [authValidate(roleSet.librarian)],
    // @ts-expect-error
    handler: async ({ body }) => {
      const result = await updateBookOrBookInfo(body);

      if (result instanceof PubdateFormatError) {
        return pubdateFormatError;
      }
      return { status: 200, body: '책 정보가 수정되었습니다.' } as const;
    },
  },
  updateDonator: {
    // middleware: [authValidate(roleSet.librarian)],
    // @ts-expect-error
    handler: async ({ body }) => {
      const result = await updateBookDonator(body);

      return { status: 200, body: '기부자 정보가 수정되었습니다.' } as const;
    },
  },
});
