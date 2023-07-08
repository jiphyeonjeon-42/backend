import {
  FindOptionsWhere, Like, QueryRunner, Repository,
} from 'typeorm';
import { P, match } from 'ts-pattern';
import { deepEqual } from 'node:assert/strict';
import jipDataSource from '../../app-data-source';
import Reviews from '../../entity/entities/Reviews';
import * as errorCode from '../../utils/error/errorCode';
import BookInfo from '../../entity/entities/BookInfo';
import User from '../../entity/entities/User';
import ErrorResponse from '../../utils/error/errorResponse';
import * as DTO from '../../DTO';

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
      throw new ErrorResponse(errorCode.INVALID_INPUT_REVIEWS, 400);
    }
  }

  async createReviews(userId: number, bookInfoId: number, content: string): Promise<void> {
    await this.insert({
      userId, bookInfoId, content, updateUserId: userId,
    });
  }

  /** @deprecated {@link getReviewsPage}를 사용해주세요. */
  async getReviewsPageOld(
    reviewerId: number,
    isMyReview: boolean,
    titleOrNickname :string,
    disabled: number,
    page: number,
    sort: 'ASC' | 'DESC' | undefined,
    limit: number,
  ): Promise<DTO.Review[]> {
    const reviews = this.createQueryBuilder('reviews')
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
      .orderBy('reviews.id', sort);
    if (isMyReview === true) {
      reviews.andWhere({ userId: reviewerId });
    } else if (!isMyReview && titleOrNickname !== '') {
      reviews.andWhere(`(title LIKE '%${titleOrNickname}%' OR nickname LIKE '%${titleOrNickname}%')`);
    }
    if (disabled !== -1) {
      reviews.andWhere({ disabled });
    }
    const ret = await reviews.offset(page * limit)
      .limit(limit)
      .getRawMany();
    return ret;
  }

  /** {@link getReviewsPageOld}와 쿼리 결과가 다르다면 scarf005를 asignee로 버그 리포트를 작성해주세요. */
  async getReviewsPage(
    reviewerId: number,
    isMyReview: boolean,
    titleOrNickname: string,
    disabled: 0 | 1 | -1,
    page: number,
    sort: 'ASC' | 'DESC',
    limit: number,
  ): Promise<Reviews[]> {
    const where = ReviewsRepository.searchOptions(
      reviewerId,
      isMyReview,
      titleOrNickname,
      disabled,
    );

    const reviews = await this.find({
      relations: { user: true, bookInfo: true },
      select: {
        id: true,
        userId: true,
        bookInfoId: true,
        content: true,
        createdAt: true,
        disabled: true,
        bookInfo: { title: true },
        user: { nickname: true, intraId: true },
      },
      order: { id: sort },
      where,
      take: limit,
      skip: page * limit,
    });

    return reviews;
  }

  /** @deprecated {@link getReviewsCounts}을 사용해주세요. */
  async getReviewsCountsOld(
    reviewerId: number,
    isMyReview: boolean,
    titleOrNickname: string,
    disabled: number,
  ) : Promise<number> {
    const reviews = this.createQueryBuilder('reviews')
      .select('COUNT(*)', 'counts')
      .leftJoin(User, 'user', 'user.id = reviews.userId')
      .leftJoin(BookInfo, 'book_info', 'reviews.bookInfoId = book_info.id')
      .where('reviews.isDeleted = false');
    if (isMyReview === true) {
      reviews.andWhere({ userId: reviewerId });
    } else if (!isMyReview && titleOrNickname !== '') {
      reviews.andWhere(`(title LIKE '%${titleOrNickname}%' OR nickname LIKE '%${titleOrNickname}%')`);
    }
    if (disabled !== -1) {
      reviews.andWhere({ disabled });
    }
    const ret = await reviews.getRawOne();
    return parseInt(ret.counts, 10);
  }

  /** {@link getReviewsCountsOld}와 쿼리 결과가 다르다면 scarf005를 asignee로 버그 리포트를 작성해주세요. */
  async getReviewsCounts(
    reviewerId: number,
    isMyReview: boolean,
    titleOrNickname: string,
    disabled: -1 | 0 | 1,
  ): Promise<number> {
    const where = ReviewsRepository.searchOptions(
      reviewerId,
      isMyReview,
      titleOrNickname,
      disabled,
    );

    const count = await this.count({ relations: { user: true, bookInfo: true }, where });
    const old = await this.getReviewsCountsOld(reviewerId, isMyReview, titleOrNickname, disabled);
    deepEqual(count, old);
    return count;
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

  static searchOptions(
    reviewerId: number,
    isMyReview: boolean,
    titleOrNickname: string,
    disabled: -1 | 0 | 1,
  ): FindOptionsWhere<Reviews> | FindOptionsWhere<Reviews>[] {
    const base = {
      isDeleted: false,
      disabled: disabled !== -1 ? !!disabled : undefined,
    } satisfies FindOptionsWhere<Reviews>;

    const byUserId = () => ({
      ...base,
      userId: reviewerId,
    }) satisfies FindOptionsWhere<Reviews>;

    const byTitleOrNickname = () => [
      { ...base, bookInfo: { title: Like(`%${titleOrNickname}%`) } },
      { ...base, user: { nickname: Like(`%${titleOrNickname}%`) } },
    ] satisfies FindOptionsWhere<Reviews>[];

    const where = match({ isMyReview, titleOrNickname })
      .with({ isMyReview: true }, byUserId)
      .with({ isMyReview: false, titleOrNickname: P.string.minLength(1) }, byTitleOrNickname)
      .otherwise(() => base);

    return where;
  }
}
