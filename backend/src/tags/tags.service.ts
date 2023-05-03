import { Like } from 'typeorm';
// import * as errorCheck from './utils/errorCheck';
import { QueryRunner } from 'typeorm';
import SuperTag from '../entity/entities/SuperTag';
import { SubTagRepository, SuperTagRepository } from './tags.repository';
import jipDataSource from '../app-data-source';
import * as errorCode from '../utils/error/errorCode';
import ErrorResponse from "../utils/error/errorResponse";
import { DBError } from '../mysql';
import { ErrorCode } from '@slack/web-api';
import { superDefaultTag } from './DTO.temp';

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

  async searchSubDefaultTags(page: number, limit: number, visibility: string, title: string)
  : Promise<Object> {
    const conditions: any = {};
    switch (visibility) {
      case 'public':
        conditions.isPublic = 1;
        break;
      case 'private':
        conditions.isPublic = 0;
        break;
      default:
        conditions.isPublic = 1;
        break;
    }
    if (title) { conditions.title = Like(`%${title}%`); }
    const [items, count] = await this.superTagRepository.getSubAndSuperTags(
      page,
      limit,
      conditions,
    );
    const itemPerPage = (Number.isNaN(limit)) ? 10 : limit;
    const meta = {
      totalItems: count,
      itemPerPage,
      totalPages: parseInt(String(count / itemPerPage
        + Number((count % itemPerPage !== 0) || !count)), 10),
      firstPage: page === 0,
      finalPage: page === parseInt(String(count / itemPerPage), 10),
      currentPage: page,
    };
    return { items, meta };
  }

  async searchSubTags(superTagId: number): Promise<Object> {
    const subTags = await this.subTagRepository.getSubTags({ superTagId });
    return subTags;
  }

  async searchSuperDefaultTags(bookInfoId: number): Promise<Object> {
    let superDefaultTags: Array<superDefaultTag> = [];

    superDefaultTags = await this.superTagRepository.getSuperTagsWithSubCount(bookInfoId);
    const defaultTagId = await this.superTagRepository.getDefaultTagId(bookInfoId);
    const defaultTags = await this.subTagRepository.getSubTags({ superTagId: defaultTagId });
    defaultTags.forEach((defaultTag) => {
      superDefaultTags.push({
        id: defaultTag.id,
        content: defaultTag.content,
        count: 0,
      });
    });
    return superDefaultTags;
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
