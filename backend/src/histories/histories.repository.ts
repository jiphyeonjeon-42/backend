import { Repository } from 'typeorm';
import VHistories from '../entity/entities/VHistories';
import jipDataSource from '../app-data-source';

class HistoriesRepository extends Repository<VHistories> {
  constructor() {
    super(VHistories, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
  }

  async getHistoriesItems(conditions: {}, limit: number, page: number)
  : Promise<[VHistories[], number]> {
    const [histories, count] = await this.findAndCount({
      where: conditions,
      take: limit,
      skip: page * limit,
      order: {
        createdAt: 'DESC',
        login: 'DESC',
      },
    });
    return [histories, count];
  }
}

export default (new HistoriesRepository());
