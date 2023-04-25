// import * as errorCheck from './utils/errorCheck';
import { QueryRunner } from 'typeorm';
import SuperTag from '../entity/entities/SuperTag';
import SubTagRepository, { SuperTagRepository } from './tags.repository';
import jipDataSource from '../app-data-source';
import * as errorCode from '../utils/error/errorCode';
import { DBError } from '../mysql';

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
}

export default TagsService;
