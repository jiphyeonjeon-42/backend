import { QueryRunner, Repository } from 'typeorm';
import jipDataSource from '../app-data-source';
import Likes from '../entity/entities/Likes';

class LikesRepository extends Repository<Likes> {
  private transactionQueryRunner: QueryRunner | null;

  constructor() {
    super(
      Likes,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );
  }

  async getLikesByBookInfoId(bookInfoId: number) : Promise<Likes[]> {
    const likes = await this.find({
      where: {
        bookInfoId,
      },
    });
    return likes;
  }
}

export = new LikesRepository();
