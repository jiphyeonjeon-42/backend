import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import BookInfo from './BookInfo';
import SuperTag from './SuperTag';
import SubTag from './SubTag';
import User from './User';

@ViewEntity('v_tags_sub_default', {
  expression: (Data: DataSource) => Data.createQueryBuilder()
    .select('sp.bookInfoId', 'bookInfoId')
    .addSelect('bi.title', 'title')
    .addSelect('sb.id', 'id')
    .addSelect('DATE_FORMAT(sb.createdAt, "%Y-%m-%d")', 'createdAt')
    .addSelect('u.nickname', 'login')
    .addSelect('sb.content', 'content')
    .addSelect('sp.id', 'superTagId')
    .addSelect('sp.content', 'superContent')
    .addSelect('sb.isPublic', 'isPublic')
    .from(SuperTag, 'sp')
    .innerJoin(SubTag, 'sb', 'sb.superTagId = sp.id')
    .innerJoin(BookInfo, 'bi', 'bi.id = sp.bookInfoId')
    .innerJoin(User, 'u', 'u.id = sb.userId'),
})
export class VTagsSubDefault {
  @ViewColumn()
  bookInfoId: number;

  @ViewColumn()
  title: string;

  @ViewColumn()
  id: number;

  @ViewColumn()
  createdAt: string;

  @ViewColumn()
  login: string;

  @ViewColumn()
  content: string;

  @ViewColumn()
  superTagId: number;

  @ViewColumn()
  superContent: string;

  @ViewColumn()
  isPublic: boolean;
}

export default VTagsSubDefault;
