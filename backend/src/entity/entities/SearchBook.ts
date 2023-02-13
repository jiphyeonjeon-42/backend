import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import BookInfo from './BookInfo';
import Book from './Book';
import Category from './Category';

@ViewEntity('searchbook', {
  expression: (Data: DataSource) => Data.createQueryBuilder()
    .select('book.infoId', 'bookInfoId')
    .addSelect('book_info.title', 'title')
    .addSelect('book_info.author', 'author')
    .addSelect('book_info.publisher', 'publisher')
    .addSelect("DATE_FORMAT(book_info.publishedAt, '%Y%m%d')", 'publishedAt')
    .addSelect('book_info.isbn', 'isbn')
    .addSelect('book_info.image', 'image')
    .addSelect('book.callSign', 'callSign')
    .addSelect('book.id', 'bookId')
    .addSelect('book.status', 'status')
    .addSelect('book_info.categoryId', 'categoryId')
    .addSelect('category.name', 'categoryName')
    .addSelect(
      '       IF((\n'
          + '  IF((select COUNT(*) from lending as l where l.bookId = book.id and l.returnedAt is NULL) = 0, TRUE, FALSE)\n'
          + '  AND\n'
          + '  IF((select COUNT(*) from book as b where (b.id = book.id and b.status = 0)) = 1, TRUE, FALSE)\n'
          + '  AND\n'
          + '  IF((select COUNT(*) from reservation as r where (r.bookId = book.id and status = 0)) = 0, TRUE, FALSE)\n'
          + '  ), TRUE, FALSE)',
      'isLendable',
    )
    .from(Book, 'book')
    .leftJoin(BookInfo, 'book_info', 'book_info.id = book.infoId')
    .leftJoin(Category, 'category', 'book_info.categoryId = category.id'),
})
export class SearchBook {
  @ViewColumn()
  bookId: number;

  @ViewColumn()
  bookInfoId: number;

  @ViewColumn()
  title: string;

  @ViewColumn()
  author: string;

  @ViewColumn()
  publisher: string;

  @ViewColumn()
  publishedAt: string;

  @ViewColumn()
  isbn: string;

  @ViewColumn()
  image: string;

  @ViewColumn()
  status: number;

  @ViewColumn()
  categoryId: string;

  @ViewColumn()
  callSign: string;

  @ViewColumn()
  categoryName: string;

  @ViewColumn()
  isLendable: boolean;
}
