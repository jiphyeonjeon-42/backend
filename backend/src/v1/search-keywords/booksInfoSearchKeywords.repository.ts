import { QueryRunner, Repository } from 'typeorm';
import jipDataSource from '~/app-data-source';
import { BookInfo, BookInfoSearchKeywords } from '~/entity/entities';
import { disassembleHangul, extractHangulInitials } from '../utils/processKeywords';
import { UpdateBookInfo } from '../books/books.type';
import { FindBookInfoSearchKeyword } from './searchKeywords.type';

class BookInfoSearchKeywordRepository extends Repository<BookInfoSearchKeywords> {
  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(BookInfoSearchKeywords, entityManager);
  }

  async getBookInfoSearchKeyword(where: FindBookInfoSearchKeyword) {
    const bookInfoSearchKeyword = await this.findOneBy({ ...where });
    return bookInfoSearchKeyword;
  }

  async createBookInfoSearchKeyword(bookInfo: BookInfo) {
    const { id, title, author, publisher } = bookInfo;

    const disassembledTitle = disassembleHangul(title);
    const titleInitials = extractHangulInitials(title);
    const disassembledAuthor = disassembleHangul(author);
    const authorInitials = extractHangulInitials(author);
    const disassembledPublisher = disassembleHangul(publisher);
    const publisherInitials = extractHangulInitials(publisher);

    const bookInfoSearchKeyword: BookInfoSearchKeywords = {
      bookInfoId: id,
      disassembledTitle,
      titleInitials,
      disassembledAuthor,
      authorInitials,
      disassembledPublisher,
      publisherInitials,
    };
    return this.save(bookInfoSearchKeyword);
  }

  async updateBookInfoSearchKeyword(targetId: number, bookInfo: UpdateBookInfo) {
    const { id, title, author, publisher } = bookInfo;

    const disassembledTitle = disassembleHangul(title);
    const titleInitials = extractHangulInitials(title);
    const disassembledAuthor = disassembleHangul(author);
    const authorInitials = extractHangulInitials(author);
    const disassembledPublisher = disassembleHangul(publisher);
    const publisherInitials = extractHangulInitials(publisher);

    const bookInfoSearchKeyword: BookInfoSearchKeywords = {
      bookInfoId: id,
      disassembledTitle,
      titleInitials,
      disassembledAuthor,
      authorInitials,
      disassembledPublisher,
      publisherInitials,
    };
    await this.update(targetId, bookInfoSearchKeyword);
  }
}

export default BookInfoSearchKeywordRepository;
