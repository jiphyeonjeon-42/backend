import { Like, QueryRunner, Repository } from 'typeorm';
import jipDataSource from '../app-data-source';
import { SearchBook } from '../entity/entities/SearchBook';
import {
  CreateBookInfo, LendingBookList, UpdateBook, UpdateBookInfo,
} from './books.type';
import * as errorCode from '../utils/error/errorCode';
import Book from '../entity/entities/Book';
import BookInfo from '../entity/entities/BookInfo';
import Lending from '../entity/entities/Lending';
import Category from '../entity/entities/Category';
import User from '../entity/entities/User';

class BooksRepository {
  private readonly searchBook: Repository<SearchBook>;

  private readonly books: Repository<Book>;

  private readonly bookInfo: Repository<BookInfo>;

  private readonly users: Repository<User>;

  private transactionQueryRunner: QueryRunner | null;

  constructor() {
    this.transactionQueryRunner = null;
    const queryRunner = jipDataSource.createQueryRunner();
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    this.searchBook = new Repository<SearchBook>(
      SearchBook,
      entityManager,
    );
    this.books = new Repository<Book>(
      Book,
      entityManager,
    );
    this.bookInfo = new Repository<BookInfo>(
      BookInfo,
      entityManager,
    );
    this.users = new Repository<User>(
      User,
      entityManager,
    );
    console.log('book repo init');
  }

  async isExistBook(isbn: string): Promise<number> {
    return this.bookInfo.count({ where: { isbn } });
  }

  // eslint-disable-next-line no-unused-vars
  async checkNickName(nickname: string): Promise<number> {
    return this.users.count({ where: { nickname } });
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

  async getNewCallsignPrimaryNum(categoryId: string): Promise<number> {
    return await this.bookInfo.countBy({ categoryId: Number(categoryId) }) + 1;
  }

  async getOldCallsignNums(categoryAlphabet: string) {
    return this.books.createQueryBuilder()
      .select('substring(SUBSTRING_INDEX(callSign, \'.\', 1),2)', 'recommendPrimaryNum')
      .addSelect('substring(SUBSTRING_INDEX(callSign, \'.\', -1),2)', 'recommendCopyNum')
      .where('callsign like :categoryAlphabet', { categoryAlphabet: `${categoryAlphabet}%` })
      .orderBy('recommendPrimaryNum + 0', 'DESC')
      .orderBy('recommendCopyNum', 'DESC')
      .limit(1)
      .getRawOne();
  }

  async updateBookInfo(bookInfo: UpdateBookInfo): Promise<void> {
    await this.bookInfo.update(bookInfo.id, bookInfo as BookInfo);
  }

  async updateBook(book: UpdateBook): Promise<void> {
    await this.books.update(book.id, book as Book);
  }

  async createBookInfo(
    target: CreateBookInfo,
    transaction: QueryRunner | null = this.transactionQueryRunner,
  ): Promise<void> {
    const bookInfo: BookInfo = {
      title: target.title,
      author: target.author,
      publisher: target.publisher,
      publishedAt: target.pubdate,
      categoryId: Number(target.categoryId),
      isbn: target.isbn,
      image: target.image,
    };
    if (!transaction) {
      await this.bookInfo.save(bookInfo);
    } else {
      await transaction.manager.save(BookInfo, bookInfo);
    }
  }

  async createBook(
    target: CreateBookInfo,
    transaction: QueryRunner | null = this.transactionQueryRunner,
  ): Promise<void> {
    const book: Book = {
      donator: target.donator,
      donatorId: target.donatorId,
      callSign: target.callSign,
      status: 0,
      infoId: target.infoId,
    };
    if (!transaction) {
      await this.books.save(book);
    } else {
      await transaction.manager.save(Book, book);
    }
  }

  async startTransaction(): Promise<void> {
    if (!this.transactionQueryRunner) {
      this.transactionQueryRunner = jipDataSource.createQueryRunner();
      await this.transactionQueryRunner.startTransaction();
    }
  }

  async commitTransaction(): Promise<void> {
    if (this.transactionQueryRunner) { await this.transactionQueryRunner.commitTransaction(); }
  }

  async rollbackTransaction(): Promise<void> {
    if (this.transactionQueryRunner) { await this.transactionQueryRunner.rollbackTransaction(); }
  }

  async release(): Promise<void> {
    if (this.transactionQueryRunner) {
      await this.transactionQueryRunner.release();
      this.transactionQueryRunner = null;
    }
  }
}

export = new BooksRepository();
