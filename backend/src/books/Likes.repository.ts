import { QueryRunner, Repository } from 'typeorm';
import jipDataSource from '../app-data-source';
import Likes from '../entity/entities/Likes';

export default class LikesRepository extends Repository<Likes> {
  constructor(queryRunner?: QueryRunner) {
    const qr = queryRunner === undefined ? jipDataSource.createQueryRunner() : queryRunner;
    const manager = jipDataSource.createEntityManager(qr);
    super(Likes, manager);
  }

  async getLikesByBookInfoId(bookInfoId: number) : Promise<Likes[]> {
    const likes = await this.find({
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
