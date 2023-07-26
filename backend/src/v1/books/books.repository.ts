import { Like, QueryRunner, Repository } from 'typeorm';
import * as Status from 'http-status';
import { VSearchBook } from '~/entity/entities/VSearchBook';
import * as errorCode from '~/v1/utils/error/errorCode';
import Book from '~/entity/entities/Book';
import BookInfo from '~/entity/entities/BookInfo';
import Lending from '~/entity/entities/Lending';
import Category from '~/entity/entities/Category';
import User from '~/entity/entities/User';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import jipDataSource from '~/app-data-source';
import VSearchBookByTag from '~/entity/entities/VSearchBookByTag';
import {
  CreateBookInfo, LendingBookList, UpdateBook, UpdateBookInfo,
} from './books.type';
import { number } from "zod";

class BooksRepository extends Repository<Book> {
  private readonly searchBook: Repository<VSearchBook>;

  private readonly books: Repository<Book>;

  private readonly bookInfo: Repository<BookInfo>;

  private readonly users: Repository<User>;

  private readonly vSearchBookByTag: Repository<VSearchBookByTag>;

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(Book, entityManager);
    this.searchBook = new Repository<VSearchBook>(VSearchBook, entityManager);
    this.books = new Repository<Book>(Book, entityManager);
    this.bookInfo = new Repository<BookInfo>(BookInfo, entityManager);
    this.users = new Repository<User>(User, entityManager);
    this.vSearchBookByTag = new Repository<VSearchBookByTag>(VSearchBookByTag, entityManager);
  }

  async isExistBook(isbn: string | undefined): Promise<number> {
    return this.bookInfo.count({ where: { isbn } });
  }

  async countBookInfos(bookInfoId: number): Promise<number> {
    return this.bookInfo.count({ where: { id: bookInfoId } });
  }

  // eslint-disable-next-line no-unused-vars
  async checkNickName(nickname: string): Promise<number> {
    return this.users.count({ where: { nickname } });
  }

  async getBookList(
    condition: string,
    limit: number,
    page: number,
  ): Promise<VSearchBook[]> {
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

  async getBookListByTag(
    condition: object,
    page: number,
    limit: number,
    sort: object,
  ): Promise<[VSearchBookByTag[], number]> {
    const bookList = await this.vSearchBookByTag.find({
      select: [
        'id',
        'title',
        'isbn',
        'image',
        'publishedAt',
        'createdAt',
        'updatedAt',
        'category',
        'lendingCnt',
      ],
      where: condition,
      take: limit,
      skip: page * limit,
      order: sort,
    });
    const allBookList = await this.vSearchBookByTag.find({
      select: ['id'],
      where: condition,
    });
    return [bookList, allBookList.length];
  }

  async getTotalItems(condition: string): Promise<number> {
    const searchBook = await this.searchBook.count({
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
  async findOneBookById(id: string): Promise<VSearchBook | void> {
    const book = await this.searchBook.findOneBy({ bookId: Number(id) });
    if (!book) {
      throw new ErrorResponse(errorCode.NO_BOOK_ID, Status.BAD_REQUEST);
    }
    return book;
  }

  // TODO: refactact sort type
  async getLendingBookList(
    sort: string,
    limit: number,
  ): Promise<LendingBookList[]> {
    const order = sort === 'popular' ? 'lendingCnt' : 'createdAt';
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
      .orderBy(order, 'DESC')
      .addOrderBy('title', 'ASC')
      .getRawMany<LendingBookList>();
    return lendingBookList;
  }

  async getNewCallsignPrimaryNum(categoryId: string | undefined): Promise<number> {
    return (
      (await this.bookInfo.countBy({ categoryId: Number(categoryId) })) + 1
    );
  }

  async getOldCallsignNums(categoryAlphabet: string) {
    return this.books
      .createQueryBuilder()
      .select(
        "substring(SUBSTRING_INDEX(callSign, '.', 1),2)",
        'recommendPrimaryNum',
      )
      .addSelect(
        "substring(SUBSTRING_INDEX(callSign, '.', -1),2)",
        'recommendCopyNum',
      )
      .where('callsign like :categoryAlphabet', {
        categoryAlphabet: `${categoryAlphabet}%`,
      })
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
  ): Promise<BookInfo> {
    const bookInfo: BookInfo = {
      title: target.title,
      author: target.author,
      publisher: target.publisher,
      publishedAt: target.pubdate,
      categoryId: Number(target.categoryId),
      isbn: target.isbn,
      image: target.image,
    };
    return this.bookInfo.save(bookInfo);
  }

  async createBook(
    target: CreateBookInfo,
  ): Promise<void> {
    const book: Book = {
      donator: target.donator,
      donatorId: target.donatorId,
      callSign: target.callSign,
      status: 0,
      infoId: target.infoId,
    };
    await this.books.save(book);
  }
}

export default BooksRepository;
