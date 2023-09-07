import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: (Data: DataSource) =>
    Data.createQueryBuilder()
      .select('l.userId', 'userId')
      .addSelect("date_format(l.createdAt, '%Y-%m-%d')", 'lendDate')
      .addSelect('l.lendingCondition', 'lendingCondition')
      .addSelect('bi.id', 'bookInfoId')
      .addSelect('bi.title', 'title')
      .addSelect("date_format(DATE_ADD(l.createdAt, INTERVAL 14 DAY), '%Y-%m-%d')", 'duedate')
      .addSelect('bi.image', 'image')
      .addSelect(
        'CASE WHEN DATEDIFF(now(), DATE_ADD(l.createdAt, INTERVAL 14 DAY)) < 0 THEN 0 ELSE DATEDIFF(now(), DATE_ADD(l.createdAt, INTERVAL 14 DAY)) END',
        'overDueDay',
      )
      .from('lending', 'l')
      .leftJoin('book', 'b', 'l.bookId = b.id')
      .leftJoin('book_info', 'bi', 'b.infoid = bi.id')
      .where('l.returnedAt IS NULL'),
})
export class VUserLending {
  @ViewColumn()
  userId: number;

  @ViewColumn()
  lendDate: Date;

  @ViewColumn()
  lendingCondition: string;

  @ViewColumn()
  bookInfoId: number;

  @ViewColumn()
  title: string;

  @ViewColumn()
  duedate: Date;

  @ViewColumn()
  image: string;

  @ViewColumn()
  overDueDay: number;
}
