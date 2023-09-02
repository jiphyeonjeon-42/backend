import { QueryRunner, Repository } from 'typeorm';
import jipDataSource from '~/app-data-source';
import { SearchKeywords } from '~/entity/entities';
import { CreateSearchKeyword, FindSearchKeyword } from './searchKeywords.type';

class SearchKeywordsRepository extends Repository<SearchKeywords> {
  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(SearchKeywords, entityManager);
  }

  async findSearchKeyword(where: FindSearchKeyword): Promise<SearchKeywords | null> {
    const searchKeyword = await this.findOneBy({ ...where });
    return searchKeyword;
  }

  async createSearchKeyword(target: CreateSearchKeyword): Promise<SearchKeywords> {
    const searchLog: SearchKeywords = {
      ...target,
    };
    return this.save(searchLog);
  }
}

export default SearchKeywordsRepository;
