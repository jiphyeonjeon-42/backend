import { QueryRunner, Repository } from 'typeorm';
import jipDataSource from '~/app-data-source';
import { BookInfo, BookInfoSearchKeywords } from '~/entity/entities';
import {
  disassembleHangul,
  extractHangulInitials,
} from '../utils/disassembleKeywords';

class BookInfoSearchKeywordRepository extends Repository<BookInfoSearchKeywords> {
  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(BookInfoSearchKeywords, entityManager);
  }

  async createBookInfoSearchKeyword(
    target: BookInfo,
  ): Promise<BookInfoSearchKeywords> {
    const {
      id, title, author, publisher,
    } = target;

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
}

export default BookInfoSearchKeywordRepository;
