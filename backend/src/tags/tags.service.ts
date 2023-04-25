// import * as errorCheck from './utils/errorCheck';
import SubTagRepository from './tags.repository';

export class TagsService {
  private readonly subTagRepository : SubTagRepository;

  constructor() {
    this.subTagRepository = new SubTagRepository();
  }

  // TODO => 그 책에 '분류 안됨'이라는 슈퍼태그가 있는지 검사 -> super_tag 테이블에서 content가 'default' (분류안됨) 있는지 체크하기  -> bookinfoid를 받아오니깐 where절에 조건으로 넣어주기
  // TODO => 만약에 없다면, 그 책에 대해 '분류 안됨'이라는 태그 생성 후 id 가져오기(반환하기) -> 만약에 없다면 다른값 'null' 값 반환함 
  // TODO => createDefaultTags에 superTagId 같이 전달
  
  async createDefaultTags(userId: number, bookInfoId: number, content: string) {
    await this.subTagRepository.createDefaultTags(userId, bookInfoId, content);
  }

}

export default new TagsService()
