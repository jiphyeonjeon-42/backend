import jipDataSource from '~/app-data-source';
import * as BooksService from './books.service';
import { CreateBookInfo } from './books.type';

describe('BooksService', () => {
  beforeAll(async () => {
    await jipDataSource
      .initialize()
      .then(() => console.log('good!'))
      .catch((err) => console.log(err));
  });
  afterAll(() => {
    jipDataSource.destroy();
  });

  it('CreateBookInfo', async () => {
    const book: CreateBookInfo = {
      title: 'test',
      pubdate: '20230101',
      callSign: '',
      author: 'testauthor',
      publisher: 'testpublisher',
      isbn: 'test0000',
      donator: 'testdonator',
      categoryId: '1',
      donatorId: null,
      infoId: 1,
    };
    console.log(await BooksService.createBook(book));
  });

  // it('Search books by name, author, or isbn', async () => {
  //   const query = 'C언어';
  //   const sort = '';
  //   const page = 0;
  //   const limit = 3;
  //   expect(await BooksService.searchInfo(query, sort, page, limit, null)).toEqual(
  //     expect.objectContaining({
  //       categories: expect.any(Array),
  //       items: expect.any(Array),
  //     }),
  //   );
  // });
});
