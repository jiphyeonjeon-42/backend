import { In, Like, QueryRunner } from 'typeorm';
import { ErrorCode } from '@slack/web-api';
import SuperTag from '../entity/entities/SuperTag';
import { SubTagRepository, SuperTagRepository } from './tags.repository';
import jipDataSource from '../app-data-source';
import * as errorCode from '../utils/error/errorCode';
import ErrorResponse from '../utils/error/errorResponse';
import { DBError } from '../mysql';
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

  async releaseConnection() {
    if (this.queryRunner.isReleased === false) await this.queryRunner.release();
  }

  async createDefaultTags(userId: number, bookInfoId: number, content: string) {
    
    let defaultTagsInsertion: superDefaultTag;
    try {
      await this.queryRunner.startTransaction();
      const defaultTag: SuperTag | null = await this.superTagRepository.getDefaultTag(bookInfoId);
      let defaultTagId;
      if (defaultTag === null) {
        defaultTagId = await this.superTagRepository.createSuperTag('default', bookInfoId, userId);
      } else {
        defaultTagId = defaultTag.id;
      }
      const subTagId = await this.subTagRepository.createDefaultTags(userId, bookInfoId, content, defaultTagId);
      const subTag = await this.subTagRepository.getSubTags({ id: subTagId });

      defaultTagsInsertion = {
        id: subTag[0].id,
        content: subTag[0].content,
        login: subTag[0].login,
        count: 0,
        type: 'default',
      };
      await this.queryRunner.commitTransaction();
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      throw new Error(errorCode.CREATE_FAIL_TAGS);
    } finally {
      await this.queryRunner.release();
    }

    return defaultTagsInsertion;
  }

  async searchSubDefaultTags(page: number, limit: number, visibility: string, query: string)
  : Promise<Object> {
    const conditions: Array<Object> = [];
    const deleteAndVisibility: any = { isDeleted: 0, isPublic: null };

    if (visibility === 'public') {
      deleteAndVisibility.isPublic = 1;
    } else if (visibility === 'private') {
      deleteAndVisibility.isPublic = 0;
    }
    if (query) {
      conditions.push(
        { ...deleteAndVisibility, title: Like(`%${query}%`) },
        { ...deleteAndVisibility, content: Like(`%${query}%`) },
      );
    } else {
      conditions.push(deleteAndVisibility);
    }
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
    const subTags = await this.subTagRepository.getSubTags({
      superTagId,
      isDeleted: 0,
      isPublic: 1,
    });
    return subTags;
  }

  async searchSuperDefaultTags(bookInfoId: number): Promise<Object> {
    let superDefaultTags: Array<superDefaultTag> = [];
    const superTags = await this.superTagRepository.getSuperTagsWithSubCount(bookInfoId);
    superDefaultTags = superTags.map((sp) => ({
      ...sp,
      count: Number(sp.count),
      type: 'super',
    }));
    const defaultTag = await this.superTagRepository.getDefaultTag(bookInfoId);
    if (defaultTag) {
      const defaultTags = await this.subTagRepository.getSubTags(
        {
          superTagId: defaultTag.id,
          isPublic: 1,
          isDeleted: 0,
        },
      );
      defaultTags.forEach((dt) => {
        superDefaultTags.push({
          id: dt.id,
          content: dt.content,
          login: dt.login,
          count: 0,
          type: 'default',
        });
      });
    }
    return superDefaultTags;
  }

  async createSuperTags(userId: number, bookInfoId: number, content: string) {
    let superTagsInsertion: superDefaultTag;
    try {
      await this.queryRunner.startTransaction();
      const superTagId = await this.superTagRepository.createSuperTag(content, bookInfoId, userId);
      const superTag = await this.superTagRepository.getSuperTags({ id: superTagId });
      const superLogin: string | null = await this.superTagRepository.getSuperTagLogin(superTagId);

      if (superLogin === null) throw new Error(errorCode.CREATE_FAIL_TAGS);
      superTagsInsertion = {
        id: superTag[0].id,
        content: superTag[0].content,
        login: superLogin,
        count: 0,
        type: 'super',
      };
      await this.queryRunner.commitTransaction();
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      throw new Error(errorCode.CREATE_FAIL_TAGS);
    } finally {
      await this.queryRunner.release();
    }
    return superTagsInsertion;
  }

  async deleteSuperTag(superTagsId: number, deleteUser: number) {
    await this.superTagRepository.deleteSuperTag(superTagsId, deleteUser);
  }

  async deleteSubTag(subTagsId: number, deleteUser: number) {
    await this.subTagRepository.deleteSubTag(subTagsId, deleteUser);
  }

  async isValidSuperTagId(superTagId: number, bookInfoId: number): Promise<boolean> {
    const superTagCount = await this.superTagRepository.countSuperTag({
      id: superTagId,
      bookInfoId,
    });
    return superTagCount > 0;
  }

  async isValidSubTagId(subTagId: number | number[]): Promise<boolean> {
    if (Array.isArray(subTagId)) {
      const subTagCounts: number[] = await Promise.all(
        subTagId.map((id) => this.subTagRepository.countSubTag({ id })),
      );
      return subTagCounts.every((count) => count > 0);
    }
    const subTagCount = await this.subTagRepository.countSubTag({ id: subTagId });
    return subTagCount > 0;
  }

  async mergeTags(
    bookInfoId: number,
    subTagIds: number[],
    rawSuperTagId: number,
    userId: number,
  ) {
    let superTagId = 0;

    try {
      await this.queryRunner.startTransaction();
      if (rawSuperTagId === 0) {
        const defaultTag = await this.superTagRepository.getDefaultTag(bookInfoId);
        if (defaultTag === null) {
          superTagId = await this.superTagRepository.createSuperTag('default', bookInfoId, userId);
        } else { superTagId = defaultTag.id; }
      } else { superTagId = rawSuperTagId; }
      await this.subTagRepository.mergeTags(subTagIds, superTagId, userId);
      await this.queryRunner.commitTransaction();
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      throw new Error(errorCode.UPDATE_FAIL_TAGS);
    } finally {
      await this.queryRunner.release();
    }
    return superTagId;
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
    const defaultTag: SuperTag | null = await this.superTagRepository.getDefaultTag(bookInfoId);
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

  async isValidBookInfoId(bookInfoId: number): Promise<boolean> {
    if (bookInfoId === null || bookInfoId === undefined || bookInfoId === 0) {
      return false;
    }
    const count: number = await this.superTagRepository.countBookInfoId(bookInfoId);
    if (count === 0) {
      return false;
    }
    return true;
  }

  async isDuplicatedSubDefaultTag(content: string, bookInfoId: number): Promise<boolean> {
    const subDefaultTag: VTagsSubDefault[] = await this.subTagRepository.getSubTags({
      content,
      bookInfoId,
    });
    if (subDefaultTag.length === 0) {
      return false;
    }
    return true;
  }

  async isDuplicatedSuperTag(content: string, bookInfoId: number): Promise<boolean> {
    const superTag: SuperTag[] = await this.superTagRepository.getSuperTags({
      content,
      bookInfoId,
    });
    if (superTag.length === 0) {
      return false;
    }
    return true;
  }
}

export default TagsService;
