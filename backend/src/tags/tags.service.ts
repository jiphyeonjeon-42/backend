// import * as errorCheck from '../utils/errorCheck';
import { Like } from 'typeorm';
import TagsRepository from './tags.repository';

export class TagsService {
  private readonly tagsRepository : TagsRepository;

  constructor() {
    this.tagsRepository = new TagsRepository();
  }

  async createDefaultTags(userId: number, bookInfoId: number, content: string) {
    await this.tagsRepository.createDefaultTags(userId, bookInfoId, content);
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
    const [items, count] = await this.tagsRepository.searchSubDefaultTags(
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

export default new TagsService();
