import * as BooksService from './books.service';

describe('BooksService', () => {
  it('A book is added and deleted', async () => {
    const book: BooksService.Book = {
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
});
