import { QueryRunner, Repository } from 'typeorm';
import jipDataSource from '~/app-data-source';
import { SearchLogs } from '~/entity/entities';
import { CreateSearchLog } from './searchKeywords.type';

class SearchLogsRepository extends Repository<SearchLogs> {
  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(SearchLogs, entityManager);
  }

  async createSearchLog(searchLog: CreateSearchLog): Promise<SearchLogs> {
    return this.save(searchLog);
  }
}

export default SearchLogsRepository;
