import { Like } from 'typeorm';
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

  // [v] TODO => 그 책에 '분류 안됨'이라는 슈퍼태그가 있는지 검사 -> super_tag 테이블에서 content가 'default' (분류안됨) 있는지 체크하기  -> bookinfoid를 받아오니깐 where절에 조건으로 넣어주기
  // [] TODO => 만약에 없다면, 그 책에 대해 '분류 안됨'이라는 태그 생성 후 id 가져오기(반환하기) -> 만약에 없다면 다른값 'null' 값 반환함
  // [] TODO => createDefaultTags에 superTagId 같이 전달

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
    const [items, count] = await this.subTagRepository.searchSubDefaultTags(
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
}

export default TagsService;
