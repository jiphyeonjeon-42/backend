import {
  QueryRunner, Repository,
} from 'typeorm';
import jipDataSource from '../app-data-source';
import book from '../entity/entities/Book';
import VSearchBook from '../entity/entities/VSearchBook';

class StocksRepository extends Repository<book> {
  private readonly vSearchBook: Repository<VSearchBook>;

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(book, entityManager);

    this.vSearchBook = new Repository<VSearchBook>(
      VSearchBook,
      entityManager,
    );
  }

  async getAllStocksAndCount(limit:number, page:number)
  : Promise<[VSearchBook[], number]> {
    const [items, totalItems] = await this.vSearchBook
      .findAndCount({
        where: { isLendable: true },
        take: limit,
        skip: limit * page,
      });
    return [items, totalItems];
  }

  async getStockById(bookId: number) {
    const stock = await this.vSearchBook
      .findOneBy({ bookId });
    if (stock === null) { throw new Error('701'); }
    return stock;
  }

  async updateBook(bookId: number) {
    await this
      .update(bookId, { updatedAt: new Date() });
  }
}
export default StocksRepository;
