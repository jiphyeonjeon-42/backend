/* eslint-disable max-classes-per-file */
import {
  LessThan,
  QueryRunner, Repository,
} from 'typeorm';
import { startOfDay, addDays } from 'date-fns';
import jipDataSource from '../app-data-source';
import book from '../entity/entities/Book';
import { VStock } from '../entity/entities/VStock';

export class StockNotFoundError extends Error {
  constructor(bookId: number) { super(`Stock with id ${bookId} not found`); }
}

class StocksRepository extends Repository<book> {
  private readonly vStock: Repository<VStock>;

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(book, entityManager);

    this.vStock = new Repository(VStock, entityManager);
  }

  async getAllStocksAndCount(limit: number, page: number)
  : Promise<[VStock[], number]> {
    const today = startOfDay(new Date());
    const [items, totalItems] = await this.vStock
      .findAndCount({
        where: {
          updatedAt: LessThan(addDays(today, -15)),
        },
        take: limit,
        skip: limit * page,
      });
    return [items, totalItems];
  }

  async getStockById(bookId: number): Promise<VStock | StockNotFoundError> {
    const stock = await this.vStock
      .findOneBy({ bookId });

    return stock ?? new StockNotFoundError(bookId);
  }

  async updateBook(bookId: number): Promise<null | StockNotFoundError> {
    const result = await this
      .update(bookId, { updatedAt: new Date() });

    if (result.affected === 0) {
      return new StockNotFoundError(bookId);
    }
    return null;
  }
}
export default StocksRepository;
