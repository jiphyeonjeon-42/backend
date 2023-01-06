import { Like, Repository } from 'typeorm';
import jipDataSource from '../app-data-source';
import { SearchBook } from '../entity/entities/SearchBook';
import { LendingBookList, UpdateBook, UpdateBookInfo } from './books.type';
import * as errorCode from '../utils/error/errorCode';
import Book from '../entity/entities/Book';
import BookInfo from '../entity/entities/BookInfo';
import Lending from '../entity/entities/Lending';
import Category from '../entity/entities/Category';

class BooksRepository {
  private readonly searchBook: Repository<SearchBook>;

  private readonly books: Repository<Book>;

  private readonly bookInfo: Repository<BookInfo>;

  constructor() {
    this.searchBook = new Repository<SearchBook>(
      SearchBook,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );
    this.books = new Repository<Book>(
      Book,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );
    this.bookInfo = new Repository<BookInfo>(
      BookInfo,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );
    console.log('book repo init');
  }

  async getBookList(
    condition: string,
    limit: number,
    page: number,
  ): Promise<SearchBook[]> {
    const searchBook = await this.searchBook.find({
      where: [
        { title: Like(`%${condition}%`) },
        { author: Like(`%${condition}%`) },
        { isbn: Like(`%${condition}%`) },
      ],
      take: limit,
      skip: page * limit,
    });
    return searchBook;
  }

  async getTotalItems(condition: string): Promise<SearchBook[]> {
    const searchBook = await this.searchBook.find({
      select: { bookId: true },
      where: [
        { title: Like(`%${condition}%`) },
        { author: Like(`%${condition}%`) },
        { isbn: Like(`%${condition}%`) },
      ],
    });
    return searchBook;
  }

  // TODO: support variable repo.
  async findOneById(id: string): Promise<SearchBook | void> {
    await this.searchBook.findOneBy({ bookId: Number(id) }).then((res) => {
      if (!res) {
        throw new Error(errorCode.NO_BOOK_ID);
      }
      return res;
    });
  }

  // TODO: refactact sort type
  async getLendingBookList(
    sort: string,
    limit: number,
  ): Promise<LendingBookList[]> {
    const orderingArr = [
      { createdAt: 'DESC', title: 'ASC' },
      { lendingCnt: 'DESC', title: 'ASC' },
    ];
    const ordering: any = sort === 'popular' ? orderingArr[1] : orderingArr[0];
    const lendingCondition: string = sort === 'popular'
      ? 'and lending.createdAt >= date_sub(now(), interval 42 day)'
      : '';

    const lendingBookList = this.bookInfo
      .createQueryBuilder('book_info')
      .select('book_info.id', 'id')
      .addSelect('book_info.title', 'title')
      .addSelect('book_info.author', 'author')
      .addSelect('book_info.publisher', 'publisher')
      .addSelect('book_info.isbn', 'isbn')
      .addSelect('book_info.image', 'image')
      .addSelect('category.name', 'category')
      .addSelect('book_info.publishedAt', 'publishedAt')
      .addSelect('book_info.createdAt', 'createdAt')
      .addSelect('book_info.updatedAt', 'updatedAt')
      .addSelect('COUNT(lending.id)', 'lendingCnt')
      .leftJoin(Book, 'book', 'book.infoId = book_info.id')
      .leftJoin(
        Lending,
        'lending',
        `lending.bookId = book.id ${lendingCondition}`,
      )
      .leftJoin(Category, 'category', 'category.id = book_info.categoryId')
      .limit(limit)
      .groupBy('book_info.id')
      .orderBy(ordering)
      .getRawMany<LendingBookList>();
    return lendingBookList;
  }

  async updateBookInfo(bookInfo: UpdateBookInfo): Promise<void> {
    await this.bookInfo.update(bookInfo.id, bookInfo as BookInfo);
  }

  async updateBook(book: UpdateBook): Promise<void> {
    await this.books.update(book.id, book as Book);
  }
}

module.exports = new BooksRepository();
