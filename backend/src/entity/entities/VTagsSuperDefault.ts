import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity('v_tags_super_default', {
  expression: (Data: DataSource) => Data.createQueryBuilder()
    .select('sp1.content', 'content')
    .addSelect((subQuery) => subQuery
      .select('COUNT(sb1.id)')
      .from('sub_tag', 'sb1')
      .where('sb1.superTagId = sp1.id')
      .andWhere('sb1.isDeleted is false')
      .andWhere('sb1.isPublic is true'), 'count')
    .addSelect('\'super\'', 'type')
    .addSelect('DATE_FORMAT(sp1.createdAt, "%Y-%m-%d")', 'createdAt')
    .from('super_tag', 'sp1')
    .where('sp1.isDeleted IS FALSE')
    .andWhere('sp1.content != \'default\'')
    .union((subQuery) => subQuery
      .select('sb2.content', 'content')
      .addSelect('0', 'count')
      .addSelect('\'default\'', 'type')
      .addSelect('DATE_FORMAT(sb2.createdAt, "%Y-%m-%d")', 'createdAt')
      .from('sub_tag', 'sb2')
      .innerJoin('super_tag', 'sp2', 'sb2.superTagId = sp2.id')
      .where('sp2.content = \'default\'')
      .andWhere('sb2.isDeleted IS FALSE')
      .andWhere('sb2.isPublic IS TRUE')
      .andWhere('NOT EXISTS (SELECT 1 FROM super_tag sp3 WHERE sp3.content = sb2.content LIMIT 1)'))
    .orderBy('RAND()'),
})
export class VTagsSuperDefault {
  @ViewColumn()
    content: string;

  @ViewColumn()
    count: number;

  @ViewColumn()
    type: string;

  @ViewColumn()
    createdAt: string;
}
