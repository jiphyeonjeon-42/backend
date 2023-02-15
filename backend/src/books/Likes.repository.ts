import { QueryRunner, Repository } from 'typeorm';
import jipDataSource from '../app-data-source';
import Likes from '../entity/entities/Likes';

class LikesRepository extends Repository<Likes> {
  constructor(transactionQueryRunner?: QueryRunner) {
    const entityManager = jipDataSource.createEntityManager(transactionQueryRunner);
    super(Likes, entityManager);
  }

  async getLikesByBookInfoId(bookInfoId: number) : Promise<Likes[]> {
    const likes = this.find({
      where: {
        bookInfoId,
      },
    });
    return likes;
  }
}

export default LikesRepository;
