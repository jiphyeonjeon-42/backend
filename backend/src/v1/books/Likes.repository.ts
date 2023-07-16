import { QueryRunner, Repository } from 'typeorm';
import Likes from '~/entity/entities/Likes';
import jipDataSource from '~/app-data-source';

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

  async getLikesByUserId(userId: number) : Promise<Likes[]> {
    const likes = await this.find({
      where: {
        userId,
      },
    });
    return likes;
  }
}

export default LikesRepository;
