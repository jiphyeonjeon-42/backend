import LikesRepository from './Likes.repository';
import * as errorCode from '../utils/error/errorCode';
import jipDataSource from '../../app-data-source';

export default class LikesService {
  private readonly likesRepository : LikesRepository;

  constructor() {
    this.likesRepository = new LikesRepository();
  }

  // likes 존재시 에러 throw
  async assertUniqueLikes(userId: number, bookInfoId: number) {
    const LikeArray = await this.likesRepository.find({ where: { userId, bookInfoId } });
    if (LikeArray.length !== 0 && !LikeArray[0].isDeleted) {
      throw new Error(errorCode.ALREADY_LIKES);
    }
  }

  // likes 미존재시 에러 throw
  async assertExistingLikes(userId: number, bookInfoId: number) {
    const LikeArray = await this.likesRepository.find({
      where: { userId, bookInfoId, isDeleted: false },
    });
    if (LikeArray.length === 0) { throw new Error(errorCode.NONEXISTENT_LIKES); }
  }

  async createLike(userId: number, bookInfoId: number) {
    // 1. 삭제처리된 like를 되돌린다. <- affected: 1, restore성공.
    // 2. 이미 생성되있는 like값과 동일한 값을 update한다. <- affected: 1, 같은 값으로 update 함.
    // 3. 애초에 like데이터가 존재하지 않았다. <- affected: 0, 아무동작도 하지 않음.
    const likesRepo = new LikesRepository(jipDataSource.createQueryRunner());
    await likesRepo.manager.queryRunner?.connect();
    await likesRepo.manager.queryRunner?.startTransaction();
    try {
      const ret = await likesRepo.update({ userId, bookInfoId }, {
        isDeleted: false,
      });
      if (ret.affected === 0) {
        const like = likesRepo.create({ userId, bookInfoId });
        await likesRepo.save(like);
      }
      await likesRepo.manager.queryRunner?.commitTransaction();
    } catch (e) {
      await likesRepo.manager.queryRunner?.rollbackTransaction();
      throw new Error(errorCode.CREATE_FAIL_LIKES);
    } finally {
      await likesRepo.manager.queryRunner?.release();
    }

    return { userId, bookInfoId };
  }

  async deleteLike(userId: number, bookInfoId: number) {
    // update를 할때 이미 해당 데이터가 존재하는지 검사하지 말라는 이유는??
    //  UpdateResult { generatedMaps: [], raw: [], affected: 0 }
    const { affected } = await this.likesRepository.update({ userId, bookInfoId }, {
      isDeleted: true,
    });
    if (affected === 0) { throw new Error(errorCode.NONEXISTENT_LIKES); }
  }

  async getLikeInfo(userId: number, bookInfoId: number) {
    const LikeArray = await this.likesRepository.find({ where: { bookInfoId, isDeleted: false } });
    let isLiked = false;
    LikeArray.forEach((like: any) => {
      if (like.userId === userId && like.isDeleted === 0) { isLiked = true; }
    });
    return ({ bookInfoId, isLiked, likeNum: LikeArray.length });
  }
}
