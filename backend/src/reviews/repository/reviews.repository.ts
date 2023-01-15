import { Repository, Like } from 'typeorm';
import jipDataSource from '../../app-data-source';
import Reviews from '../../entity/entities/Reviews';
import * as errorCode from '../../utils/error/errorCode';
import { executeQuery, makeExecuteQuery, pool } from '../../mysql';
import BookInfo from '../../entity/entities/BookInfo';
import User from '../../entity/entities/User';

class ReviewsRepository extends Repository<Reviews> {
  private readonly bookInfoRepo: Repository<BookInfo>;

  constructor() {
    super(Reviews, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
    const entityManager = jipDataSource.createEntityManager();
    const queryRunner = jipDataSource.createQueryRunner();

    this.bookInfoRepo = new Repository<BookInfo>(
      BookInfo,
      entityManager,
      queryRunner,
    );
  }

  async validateBookInfo(bookInfoId: number) : Promise<void> {
    const bookInfoCount = await this.bookInfoRepo.count({
      where: { id: bookInfoId },
    });
    if (bookInfoCount === 0) {
      throw new Error(errorCode.INVALID_INPUT_REVIEWS);
    }
  }

  async createReviews(userId: number, bookInfoId: number, content: string): Promise<void> {
    this.insert({
      userId, bookInfoId, content, updateUserId: userId,
    });
  }

  async getReviewsPage(
    reviewerId: number,
    isMyReview: boolean,
    titleOrNickname :string,
    disabled: number,
    page: number,
    sort: 'ASC' | 'DESC' | undefined,
    limit: number,
  ) {
    let reviewFilter = '';
    if (isMyReview) {
      reviewFilter = titleOrNickname === '' ? 'TRUE' : `book_info.title LIKE '%${titleOrNickname}%' `;
      reviewFilter = reviewFilter.concat(`reviews.userId = ${reviewerId}`);
    } else {
      reviewFilter = titleOrNickname === '' ? 'TRUE' : `(book_info.title LIKE '%${titleOrNickname}%'
                                                      OR user.nickname LIKE '%${titleOrNickname}%')`;
    }
    const disabledQuery = disabled === -1 ? 'TRUE' : `reviews.disabled = ${disabled}`;
    const limitQuery = (Number.isNaN(limit)) ? 10 : limit;
    const offset = (Number.isNaN(limit)) ? page * 10 : page * limit;

    const reviews = await this.createQueryBuilder('reviews')
      .select('reviews.id', 'reviewsId')
      .addSelect('reviews.userId', 'reviewerId')
      .addSelect('reviews.bookInfoId', 'bookInfoId')
      .addSelect('reviews.content', 'content')
      .addSelect('reviews.createdAt', 'createdAt')
      .addSelect('reviews.disabled', 'disabled')
      .addSelect('book_info.title', 'title')
      .addSelect('user.nickname', 'nickname')
      .addSelect('user.intraId', 'intraId')
      .leftJoin(User, 'user', 'user.id = reviews.userId')
      .leftJoin(BookInfo, 'book_info', 'reviews.bookInfoId = book_info.id')
      .where('reviews.isDeleted = false')
      .andWhere(reviewFilter)
      .andWhere(disabledQuery)
      .orderBy('reviews.id', sort)
      .offset(offset)
      .limit(limitQuery)
      .getRawMany();
    return (reviews);
  }

getReviewsCounts = async (
  reviewerId: number,
  isMyReview: boolean,
  titleOrNickname: string,
  disabled: number,
) => {
  let reviewFilter = '';
  if (isMyReview) {
    reviewFilter = titleOrNickname === '' ? '' : `AND book_info.title LIKE '%${titleOrNickname}%' `;
    reviewFilter = reviewFilter.concat(`AND reviews.userId = ${reviewerId}`);
  } else {
    reviewFilter = titleOrNickname === '' ? '' : `AND (book_info.title LIKE '%${titleOrNickname}%'
                                                    OR user.nickname LIKE '%${titleOrNickname}%')`;
  }
  const disabledQuery = disabled === -1 ? '' : `AND reviews.disabled = ${disabled}`;
  const counts = await executeQuery(`
SELECT
  COUNT(*) as counts
FROM reviews
JOIN user ON user.id = reviews.userId
JOIN book_info ON reviews.bookInfoId = book_info.id
WHERE reviews.isDeleted = false
  ${reviewFilter}
  ${disabledQuery}
`);
  return (counts[0].counts);
};

getReviewsUserId = async (
  reviewsId : number,
) => {
  const ret = await this.findOneOrFail({
    select: {
      userId: true,
    },
    where: {
      id: reviewsId,
      isDeleted: false,
    },
  });
  return ret.userId;
};

getReviews = async (
  reviewsId : number,
) => {
  // const result: any = await executeQuery(`
  //   SELECT
  //     userId,
  //     disabled
  //   FROM reviews
  //   WHERE id = ?
  //   AND isDeleted = false
  //   `, [reviewsId]);
  // return result;
  const ret = await this.find({
    select: {
      userId: true,
      disabled: true,
    },
    where: {
      id: reviewsId,
      isDeleted: false,
    },
  });
  return ret;
};

updateReviews = async (
  reviewsId : number,
  userId : number,
  content : string,
) => {
  await executeQuery(`
    UPDATE reviews
    SET
      content = ?,
      updateUserId = ?
    WHERE id = ?
    `, [content, userId, reviewsId]);
};

deleteReviews = async (reviewId: number, deleteUser: number) => {
  await executeQuery(`
      UPDATE reviews
      SET
        isDeleted = ?,
        deleteUserId = ?
      WHERE id = ?
    `, [true, deleteUser, reviewId]);
};

patchReviews = async (
  reviewsId : number,
  userId : number,
) => {
  await executeQuery(`
    UPDATE reviews
    SET
      disabled = IF(disabled=TRUE, FALSE, TRUE),
      disabledUserId = IF(disabled=FALSE, NULL, ?)
    WHERE id = ?
    `, [userId, reviewsId]);
};
}

export = new ReviewsRepository();
