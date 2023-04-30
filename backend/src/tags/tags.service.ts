// import * as errorCheck from './utils/errorCheck';
import { QueryRunner } from 'typeorm';
import SuperTag from '../entity/entities/SuperTag';
import { SubTagRepository, SuperTagRepository } from './tags.repository';
import jipDataSource from '../app-data-source';
import * as errorCode from '../utils/error/errorCode';
import ErrorResponse from "../utils/error/errorResponse";
import { DBError } from '../mysql';
import { ErrorCode } from '@slack/web-api';

export class TagsService {
  private readonly subTagRepository : SubTagRepository;

  private readonly superTagRepository : SuperTagRepository;

  private readonly queryRunner : QueryRunner;

  constructor() {
    this.queryRunner = jipDataSource.createQueryRunner();
    this.subTagRepository = new SubTagRepository(this.queryRunner);
    this.superTagRepository = new SuperTagRepository(this.queryRunner);
  }

  async createDefaultTags(userId: number, bookInfoId: number, content: string) {
		try {
      await this.queryRunner.startTransaction();
      const defaultTag: SuperTag | null = await this.superTagRepository.getDefaultTagId(bookInfoId);
      let defaultTagId;
      if (defaultTag === null) {
        defaultTagId = await this.superTagRepository.createSuperTag('default', bookInfoId, userId);
      } else {
        defaultTagId = defaultTag.id;
      }
      await this.subTagRepository.createDefaultTags(userId, bookInfoId, content, defaultTagId);
      await this.queryRunner.commitTransaction();
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      throw new Error(errorCode.CREATE_FAIL_TAGS);
    } finally {
      await this.queryRunner.release();
    }
  }

	async createSuperTags(userId: number, bookInfoId: number, content: string) {
		try {
      await this.queryRunner.startTransaction();
			await this.superTagRepository.createSuperTag(content, bookInfoId, userId);
      await this.queryRunner.commitTransaction();
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      throw new Error(errorCode.CREATE_FAIL_TAGS);
    } finally {
      await this.queryRunner.release();
    }
  }
}

export default TagsService;
