import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { BookInfo } from './BookInfo';
import { Category } from './Category';
import { SubTag } from './SubTag';
import { SuperTag } from './SuperTag';

@ViewEntity('v_search_book_by_tag', {
  expression: (Data: DataSource) =>
    Data.createQueryBuilder()
      .distinctOn(['bi.id'])
      .select('bi.id', 'id')
      .addSelect('bi.title', 'title')
      .addSelect('bi.author', 'author')
      .addSelect('bi.isbn', 'isbn')
      .addSelect('bi.image', 'image')
      .addSelect('bi.publishedAt', 'publishedAt')
      .addSelect('bi.createdAt', 'createdAt')
      .addSelect('bi.updatedAt', 'updatedAt')
      .addSelect('c.name', 'category')
      .addSelect('sp.content', 'superTagContent')
      .addSelect('sb.content', 'subTagContent')
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(l.id)')
            .from('book', 'b')
            .leftJoin('lending', 'l', 'l.bookId = b.id')
            .innerJoin('book_info', 'bi2', 'bi2.id = b.infoId')
            .where('bi.id = bi.id'),
        'lendingCnt',
      )
      .from(BookInfo, 'bi')
      .innerJoin(Category, 'c', 'c.id = bi.categoryId')
      .innerJoin(SuperTag, 'sp', 'sp.bookInfoId = bi.id')
      .leftJoin(SubTag, 'sb', 'sb.superTagId = sp.id'),
})
export class VSearchBookByTag {
  @ViewColumn()
  id: number;

  @ViewColumn()
  title: string;

  @ViewColumn()
  author: string;

  @ViewColumn()
  isbn: number;

  @ViewColumn()
  image: string;

  @ViewColumn()
  publishedAt: string;

  @ViewColumn()
  createdAt: string;

  @ViewColumn()
  updatedAt: string;

  @ViewColumn()
  category: string;

  @ViewColumn()
  superTagContent: string;

  @ViewColumn()
  subTagContent: string;

  @ViewColumn()
  lendingCnt: number;
}

export default VSearchBookByTag;
