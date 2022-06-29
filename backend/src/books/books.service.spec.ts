import { pool } from '../mysql';
import * as BooksService from './books.service';
import * as models from './books.model';

describe('BooksService', () => {
  afterAll(() => {
    pool.end();
  });

  it('A book is added and deleted', async () => {
    const book: models.Book = {
      title: 'test',
      author: 'testauthor',
      publisher: 'testpublisher',
      isbn: 'test0000',
      category: '예술',
      donator: 'testdonator',
      callSign: 'H24.23 v1.c1',
      status: 0,
    };
    await BooksService.createBook(book);
    expect(await BooksService.deleteBook(book)).toBe(true);
  });

  it('Search books by name, author, or isbn', async () => {
    const query = 'C언어';
    const sort = '';
    const page = 0;
    const limit = 3;
    expect(await BooksService.searchInfo(query, sort, page, limit, null)).toEqual(
      expect.objectContaining({
        categories: expect.any(Array),
        items: expect.any(Array),
      }),
    );
  });
});
