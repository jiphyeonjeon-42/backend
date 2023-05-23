import { In, Like, QueryRunner } from 'typeorm';
import SuperTag from '../entity/entities/SuperTag';
import { SubTagRepository, SuperTagRepository } from './tags.repository';
import jipDataSource from '../app-data-source';
import * as errorCode from '../utils/error/errorCode';
import ErrorResponse from "../utils/error/errorResponse";
import { DBError } from '../mysql';
import { ErrorCode } from '@slack/web-api';
import { superDefaultTag } from '../DTO/tags.model';
import VTagsSubDefault from '../entity/entities/VTagsSubDefault';

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
    if (defaultTagId) {
      const defaultTags = await this.subTagRepository.getSubTags(
        {
          superTagId: defaultTagId,
          isPublic: 1,
        },
      );
      defaultTags.forEach((defaultTag) => {
        superDefaultTags.push({
          id: defaultTag.id,
          content: defaultTag.content,
          count: 0,
        });
      });
    }
    return superDefaultTags;
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

  async deleteSuperTag(superTagsId: number, deleteUser: number) {
    await this.superTagRepository.deleteSuperTag(superTagsId, deleteUser);
  }

  async deleteSubTag(subTagsId: number, deleteUser: number) {
    await this.subTagRepository.deleteSubTag(subTagsId, deleteUser);
  }

  async isValidTagIds(subTagIds: number[], superTagId: number): Promise<boolean> {
    const superTagCount = await this.superTagRepository.countSuperTag({ id: superTagId });
    if (superTagCount === 0) {
      return false;
    }
    const subTagCounts: number[] = await Promise.all(
      subTagIds.map((id) => this.subTagRepository.countSubTag({ id })),
    );
    return subTagCounts.every((count) => count > 0);
  }

  async mergeTags(subTagIds: number[], superTagId: number, userId: number) {
    try {
      await this.queryRunner.startTransaction();
      await this.subTagRepository.mergeTags(subTagIds, superTagId, userId);
      await this.queryRunner.commitTransaction();
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      throw new Error(errorCode.UPDATE_FAIL_TAGS);
    } finally {
      await this.queryRunner.release();
    }
  }

  async isExistingSuperTag(superTagId: number, content: string): Promise<boolean> {
    const superTag: SuperTag[] = await this.superTagRepository.getSuperTags({ id: superTagId });
    const { bookInfoId } = superTag[0];
    const duplicates: number = await this.superTagRepository.countSuperTag(
      { content, bookInfoId },
    );
    if (duplicates === 0) {
      return false;
    }
    return true;
  }

  async updateSuperTags(updateUserId: number, superTagId: number, content: string) {
    try {
      await this.queryRunner.startTransaction();
      await this.superTagRepository.updateSuperTags(updateUserId, superTagId, content);
      await this.queryRunner.commitTransaction();
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      throw new Error(errorCode.UPDATE_FAIL_TAGS);
    } finally {
      await this.queryRunner.release();
    }
  }

  async isDefaultTag(superTagId: number): Promise<boolean> {
    const superTags: SuperTag[] = await this.superTagRepository.getSuperTags({ id: superTagId });
    const { bookInfoId } = superTags[0];
    const defaultTag: SuperTag | null = await this.superTagRepository.getDefaultTagId(bookInfoId);
    if (defaultTag === null || superTagId !== defaultTag.id) {
      return false;
    }
    return true;
  }

  async isExistingSubTag(subTagId: number): Promise<boolean> {
    const count: number = await this.subTagRepository.countSubTag({ id: subTagId });
    if (count === 0) {
      return false;
    }
    return true;
  }

  async isAuthorizedUser(userId: number, subTagId: number): Promise<boolean> {
    const subTagUserId = await this.subTagRepository.getSubTagUserId(subTagId);
    if (subTagUserId !== userId) {
      return false;
    }
    return true;
  }

  async updateSubTags(userId: number, subTagId: number, visibility: string): Promise<void> {
    const isPublic = (visibility === 'public') ? 1 : 0;
    try {
      await this.queryRunner.startTransaction();
      await this.subTagRepository.updateSubTags(userId, subTagId, isPublic);
      await this.queryRunner.commitTransaction();
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      throw new Error(errorCode.UPDATE_FAIL_TAGS);
    } finally {
      await this.queryRunner.release();
    }
  }
}

export default TagsService;
