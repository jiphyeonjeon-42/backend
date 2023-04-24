import * as errorCheck from './utils/errorCheck';
import tagsRepository from '../tags.repository';

export class TagsService {
  private readonly tagsRepository : TagsRepository;

  constructor() {
    this.tagsRepository = new TagsRepository();
  }

  async createDefaultTags(userId: number, bookInfoId: number, content: string) {
    await this.tagsRepository.createDefaultTags(userId, bookInfoId, content);
  }

}

export default new TagsService()