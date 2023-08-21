import { QueryRunner, Repository } from 'typeorm';
import jipDataSource from '~/app-data-source';
import { VHistories } from '~/entity/entities';

class HistoriesRepository extends Repository<VHistories> {
  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(VHistories, entityManager);
  }

  async getHistoriesItems(conditions: {}, limit: number, page: number)
  : Promise<[VHistories[], number]> {
    const [histories, count] = await this.findAndCount({
      where: conditions,
      take: limit,
      skip: page * limit,
      order: {
        updatedAt: 'DESC',
      },
    });
    return [histories, count];
  }
}

export default HistoriesRepository;
