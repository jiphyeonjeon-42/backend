import { Like, QueryRunner, Repository } from 'typeorm';
import jipDataSource from '../app-data-source';
import { SubTag } from '../entity/entities/SubTag';
import * as errorCode from '../utils/error/errorCode';
import BookInfo from '../entity/entities/BookInfo';
import User from '../entity/entities/User';
import ErrorResponse from "../utils/error/errorResponse";
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class SubTagRepository extends Repository<SubTag> {
  private readonly bookInfoRepo: Repository<BookInfo>;

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(SubTag, entityManager);
    this.bookInfoRepo = new Repository<BookInfo>(
      BookInfo,
      entityManager,
    );
  }

  async createDefaultTags(userId: number, bookInfoId: number, content: string): Promise<void> {
    const insertObject: QueryDeepPartialEntity<SubTag> = {
        superTagId: 0,
        userid: userId,
        bookInfoId: bookInfoId,
        content: content,
        updateUserId: userId
    }
    await this.insert(insertObject);
  }
}
 