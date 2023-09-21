import { LessThan, QueryRunner, Repository } from 'typeorm';
import { startOfDay, addDays } from 'date-fns';
import { Book, VStock } from '~/entity/entities';
import jipDataSource from '~/app-data-source';

class StocksRepository extends Repository<Book> {
  private readonly vStock: Repository<VStock>;

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(Book, entityManager);

    this.vStock = new Repository<VStock>(VStock, entityManager);
  }

  async getAllStocksAndCount(limit: number, page: number): Promise<[VStock[], number]> {
    const today = startOfDay(new Date());
    const [items, totalItems] = await this.vStock.findAndCount({
      where: {
        updatedAt: LessThan(addDays(today, -15)),
      },
      take: limit,
      skip: limit * page,
    });
    return [items, totalItems];
  }

  async getStockById(bookId: number) {
    const stock = await this.vStock.findOneBy({ bookId });
    if (stock === null) {
      throw new Error('701');
    }
    return stock;
  }

  async updateBook(bookId: number) {
    await this.update(bookId, { updatedAt: new Date() });
  }
}
export default StocksRepository;
