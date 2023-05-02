import {
  InsertResult, Like, QueryRunner, Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import jipDataSource from '../app-data-source';
import SubTag from '../entity/entities/SubTag';
import * as errorCode from '../utils/error/errorCode';
import User from '../entity/entities/User';
import ErrorResponse from '../utils/error/errorResponse';
import { subDefaultTag } from './DTO.temp';
import SuperTag from '../entity/entities/SuperTag';
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
}

export class SuperTagRepository extends Repository<SuperTag> {
  private readonly vSubDefaultRepo: Repository<VTagsSubDefault>;

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
}
