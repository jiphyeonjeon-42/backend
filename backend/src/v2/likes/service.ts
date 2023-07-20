import { Repository } from "typeorm"
import type Likes from "~/entity/entities/Likes"

type Args = { userId: number, bookInfoId: number }
type LikeInfo = { bookInfoId: number, isLiked: boolean, likeNum: number }
type Error = { }
export type ILikesService = {
	createLike: (args: Args) => Promise<true | Error>
	deleteLike: (args: Args) => Promise<void>,
	getLikeInfo: (args: Args) => Promise<LikeInfo>
}

type RepoDeps = { likes: Repository<Likes> }
type MkCreateLikes = (deps: RepoDeps) => ILikesService['createLike']
type MkDeleteLikes = (deps: RepoDeps) => ILikesService['deleteLike']
type MkGetLikeInfo = (deps: RepoDeps) => ILikesService['getLikeInfo']

type AddFun = (x: number, y: number) => number
const add: AddFun = (x, y) => x + y

export const mkCreateLike: MkCreateLikes = ({ likes }) => async ({ userId, bookInfoId } ) => {
    // 1. 삭제처리된 like를 되돌린다. <- affected: 1, restore성공.
    // 2. 이미 생성되있는 like값과 동일한 값을 update한다. <- affected: 1, 같은 값으로 update 함.
    // 3. 애초에 like데이터가 존재하지 않았다. <- affected: 0, 아무동작도 하지 않음.

    await likes.manager.queryRunner?.connect();
    await likes.manager.queryRunner?.startTransaction();
    try {
      const ret = await likes.update({ userId, bookInfoId }, {
        isDeleted: false,
      });
      if (ret.affected === 0) {
        const like = likes.create({ userId, bookInfoId });
        await likes.save(like);
      }
      await likes.manager.queryRunner?.commitTransaction();
    } catch (e) {
      await likes.manager.queryRunner?.rollbackTransaction();
      return new Error(errorCode.CREATE_FAIL_LIKES);
    } finally {
      await likes.manager.queryRunner?.release();
    }

    return true;
  }

  export const mkDeleteLikes: MkDeleteLikes = ({ likes }) => async ({userId, bookInfoId}) => {
    // update를 할때 이미 해당 데이터가 존재하는지 검사하지 말라는 이유는??
    //  UpdateResult { generatedMaps: [], raw: [], affected: 0 }
    const { affected } = await likes.update({ userId, bookInfoId }, {
      isDeleted: true,
    });
    if (affected === 0) {
		throw new Error("NO EXIST LIKE");
	}
  }

  async getLikeInfo(userId: number, bookInfoId: number) {
    const LikeArray = await likes.find({ where: { bookInfoId, isDeleted: false } });
    let isLiked = false;
    LikeArray.forEach((like: any) => {
      if (like.userId === userId && like.isDeleted === 0) { isLiked = true; }
    });
    return ({ bookInfoId, isLiked, likeNum: LikeArray.length });
  }
