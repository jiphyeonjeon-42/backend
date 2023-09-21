import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { BookInfo } from './BookInfo';
import { Book } from './Book';
import { Category } from './Category';
import { Lending } from './Lending';
import { Reservation } from './Reservation';

@ViewEntity('v_stock', {
  expression: (Data: DataSource) =>
    Data.createQueryBuilder()
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
      .addSelect('book.donator', 'donator')
      .addSelect("date_format(book.updatedAt, '%Y-%m-%d %T')", 'updatedAt')
      .addSelect('book_info.categoryId', 'categoryId')
      .addSelect('category.name', 'category')
      .from(Book, 'book')
      .leftJoin(BookInfo, 'book_info', 'book_info.id = book.infoId')
      .leftJoin(Category, 'category', 'book_info.categoryId = category.id')
      .leftJoin(Lending, 'l', 'book.id = l.bookId')
      .leftJoin(Reservation, 'r', 'r.bookId = book.id AND r.status = 0')
      .groupBy('book.id')
      .having('COUNT(l.id) = COUNT(l.returnedAt) AND COUNT(r.id) = 0')
      .where('book.status = 0'),
})
export class VStock {
  @ViewColumn()
  bookId: number;

  @ViewColumn()
  bookInfoId: number;

  @ViewColumn()
  title: string;

  @ViewColumn()
  author: string;

  @ViewColumn()
  donator: string;

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
  categoryId: number;

  @ViewColumn()
  callSign: string;

  @ViewColumn()
  category: string;

  @ViewColumn()
  updatedAt: Date;
}
