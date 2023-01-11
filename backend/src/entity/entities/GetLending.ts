import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: (Data: DataSource) => Data
    .createQueryBuilder()
    .select('l.userId', 'userId')
    .addSelect('l.createdAt', 'lendDate')
    .addSelect('l.lendingCondition', 'lendingCondition')
    .addSelect('bi.id', 'bookInfoId')
    .addSelect('bi.title', 'title')
    .addSelect('DATE_ADD(l.createdAt, INTERVAL 14 DAY)', 'duedate')
    .addSelect('bi.image', 'image')
    .addSelect('CASE WHEN DATEDIFF(now(), DATE_ADD(l.createdAt, INTERVAL 14 DAY)) < 0 THEN 0 ELSE DATEDIFF(now(), DATE_ADD(l.createdAt, INTERVAL 14 DAY)) END', 'overdueday')
    .from('lending', 'l')
    .leftJoin('book', 'b', 'l.bookId = b.id')
    .leftJoin('book_info', 'bi', 'b.infoid = bi.id')
    .where('l.returnedAt IS NULL'),
})
export class GetLending {
  @ViewColumn()
  userId: number;

  @ViewColumn()
  lendDate: Date;

  @ViewColumn()
  lendingCondition: number;

  @ViewColumn()
  bookInfoId: number;

  @ViewColumn()
  title: string;

  @ViewColumn()
  duedate: Date;

  @ViewColumn()
  image: string;
}

export default GetLending;
