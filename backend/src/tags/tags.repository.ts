import {
  In, InsertResult, Like, QueryRunner, Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import jipDataSource from '../app-data-source';
import SubTag from '../entity/entities/SubTag';
import * as errorCode from '../utils/error/errorCode';
import User from '../entity/entities/User';
import SuperTag from '../entity/entities/SuperTag';
import ErrorResponse from '../utils/error/errorResponse';
import { subDefaultTag, superDefaultTag } from '../DTO/tags.model';
import VTagsSubDefault from '../entity/entities/VTagsSubDefault';

export class SubTagRepository extends Repository<SubTag> {
  private readonly vSubDefaultRepo: Repository<VTagsSubDefault>;

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(SubTag, entityManager);
    this.vSubDefaultRepo = new Repository<VTagsSubDefault>(
      VTagsSubDefault,
      entityManager,
    );
  }

  async createDefaultTags(userId: number, bookInfoId: number, content: string, superTagId: number)
  : Promise<void> {
    const insertObject: QueryDeepPartialEntity<SubTag> = {
      superTagId,
      userId,
      bookInfoId,
      content,
      updateUserId: userId,
    };
    await this.insert(insertObject);
  }

  async deleteSubTag(subTagsId: number, deleteUser: number): Promise<void> {
    await this.update(subTagsId, { isDeleted: 1, updateUserId: deleteUser });
  }

  async getSubTags(conditions: object) {
    const subTags = await this.vSubDefaultRepo.find({
      select: [
        'id',
        'content',
        'login',
      ],
      where: conditions,
    });
    return subTags;
  }

  async getSubTagUserId(subTagId: number) {
    const subTag = await this.findOne({
      where: { id: subTagId },
    });
    return subTag?.userId;
  }

  async mergeTags(subTagIds: number[], superTagId: number, userId: number) {
    await this.update(
      { id: In(subTagIds) },
      { superTagId, updateUserId: userId, updatedAt: new Date() },
    );
  }

  async countSubTag(conditions: object)
  : Promise<number> {
    const count = await this.count({
      where: conditions,
    });
    return count;
  }

  async updateSubTags(userId: number, subTagId: number, isPublic: number) {
    await this.update(
      { id: subTagId },
      { isPublic, updateUserId: userId, updatedAt: new Date() },
    );
  }
}

export class SuperTagRepository extends Repository<SuperTag> {
  private readonly vSubDefaultRepo: Repository<VTagsSubDefault>;

  private readonly userRepo: Repository<User>;

  private readonly entityManager;

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(SuperTag, entityManager);
    this.entityManager = entityManager;
    this.vSubDefaultRepo = new Repository<VTagsSubDefault>(
      VTagsSubDefault,
      this.entityManager,
    );
    this.userRepo = new Repository<User>(
      User,
      this.entityManager,
    );
  }

  async getSuperTags(conditions: object) {
    const superTags = await this.find({
      select: [
        'id',
        'content',
        'bookInfoId',
      ],
      where: conditions,
    });
    return superTags;
  }

  async getDefaultTagId(bookInfoId: number)
  : Promise<SuperTag | null> {
    const defaultTag = await this.findOne({
      select: [
        'id',
      ],
      where: {
        bookInfoId,
        content: 'default',
      },
    });
    return defaultTag;
  }

  async createSuperTag(content: string, bookInfoId: number, userId: number)
  : Promise<number> {
    const insertObject: QueryDeepPartialEntity<SuperTag> = {
      userId,
      bookInfoId,
      content,
      updateUserId: userId,
    };
    const insertResult = await this.entityManager.insert(SuperTag, insertObject);
    return insertResult.identifiers[0].id;
  }

  async deleteSuperTag(superTagsId: number, deleteUser: number): Promise<void> {
    await this.update(superTagsId, { isDeleted: 1, updateUserId: deleteUser });
  }

  async getSubAndSuperTags(page: number, limit: number, conditions: Object)
    : Promise<[subDefaultTag[], number]> {
    const [items, count] = await this.vSubDefaultRepo.findAndCount({
      select: [
        'bookInfoId',
        'title',
        'id',
        'createdAt',
        'login',
        'content',
        'superContent',
      ],
      where: conditions,
      order: { id: 'DESC' },
      skip: page * limit,
      take: limit,
    });
    const convertedItems = items as subDefaultTag[];
    return [convertedItems, count];
  }

  async getSuperTagsWithSubCount(bookInfoId: number)
    : Promise<superDefaultTag[]> {
    const superTags = await this.createQueryBuilder('sp')
      .select('sp.id', 'id')
      .addSelect('sp.content', 'content')
      .addSelect((subQuery) => subQuery
        .select('COUNT(sb.id)')
        .from(SubTag, 'sb')
        .where('sb.superTagId = sp.id'), 'count')
      .where('sp.bookInfoId = :bookInfoId AND sp.content != \'default\'', { bookInfoId })
      .getRawMany();
    return superTags as superDefaultTag[];
  }

  async countSuperTag(conditions: object)
  : Promise<number> {
    const count = await this.count({
      where: conditions,
    });
    return count;
  }

  async updateSuperTags(updateUserId: number, superTagId: number, content: string)
  : Promise<void> {
    await this.update(
      { id: superTagId },
      { content, updateUserId, updatedAt: new Date() },
    );
  }
}
