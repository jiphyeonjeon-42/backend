import { QueryRunner, Repository } from 'typeorm';
import jipDataSource from '../../app-data-source';
import Reviews from '../../entity/entities/Reviews';
import * as errorCode from '../../utils/error/errorCode';
import BookInfo from '../../entity/entities/BookInfo';
import User from '../../entity/entities/User';

export default class ReviewsRepository extends Repository<Reviews> {
  private readonly bookInfoRepo: Repository<BookInfo>;

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(Reviews, entityManager);
    this.bookInfoRepo = new Repository<BookInfo>(
      BookInfo,
      entityManager,
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
    await this.insert({
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

  async getReviewsCounts(
    reviewerId: number,
    isMyReview: boolean,
    titleOrNickname: string,
    disabled: number,
  ) : Promise<number> {
    let reviewFilter = '';
    if (isMyReview) {
      reviewFilter = titleOrNickname === '' ? 'TRUE' : `book_info.title LIKE '%${titleOrNickname}%' `;
      reviewFilter = reviewFilter.concat(`reviews.userId = ${reviewerId}`);
    } else {
      reviewFilter = titleOrNickname === '' ? 'TRUE' : `(book_info.title LIKE '%${titleOrNickname}%'
                                                        OR user.nickname LIKE '%${titleOrNickname}%')`;
    }
    const disabledQuery = disabled === -1 ? '' : `reviews.disabled = ${disabled}`;
    const queryBuilder = this.createQueryBuilder('reviews')
      .select('COUNT(*)', 'counts')
      .leftJoin(User, 'user', 'user.id = reviews.userId')
      .leftJoin(BookInfo, 'book_info', 'reviews.bookInfoId = book_info.id')
      .where('reviews.isDeleted = false')
      .andWhere(reviewFilter);
    if (disabledQuery !== '') queryBuilder.andWhere(disabledQuery);
    const ret = queryBuilder.getRawOne();
    return ret;
  }

  async getReviewsUserId(reviewsId : number): Promise<number> {
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
  }

  async getReviews(reviewsId : number): Promise<Reviews[]> {
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
  }

  async updateReviews(reviewsId : number, userId : number, content : string): Promise<void> {
    await this.update(reviewsId, { content, updateUserId: userId });
  }

  async deleteReviews(reviewId: number, deleteUser: number): Promise<void> {
    await this.update(reviewId, { isDeleted: true, deleteUserId: deleteUser });
  }

  async patchReviews(reviewsId : number, userId : number): Promise<void> {
    await this.update(
      reviewsId,
      {
        disabled: () => 'IF(disabled=TRUE, FALSE, TRUE)',
        disabledUserId: () => `IF(disabled=FALSE, NULL, ${userId})`,
      },
    );
  }
}
