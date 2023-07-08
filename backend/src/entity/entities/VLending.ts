import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: (Data: DataSource) => Data
    .createQueryBuilder()
    .select('l.id', 'id')
    .addSelect('l.lendingCondition', 'lendingCondition')
    .addSelect('u.nickname', 'login')
    .addSelect('CASE WHEN NOW() > u.penaltyEndDate THEN 0 ELSE DATEDIFF(u.penaltyEndDate, now()) END', 'penaltyDays')
    .addSelect('b.id', 'bookId')
    .addSelect('b.callSign', 'callSign')
    .addSelect('bi.title', 'title')
    .addSelect('bi.image', 'image')
    .addSelect('date_format(l.createdAt, \'%Y-%m-%d\')', 'createdAt')
    .addSelect('date_format(l.returnedAt, \'%Y-%m-%d\')', 'returnedAt')
    .addSelect('date_format(DATE_ADD(l.createdAt, INTERVAL 14 DAY), \'%Y-%m-%d\')', 'dueDate')
    .from('lending', 'l')
    .innerJoin('user', 'u', 'l.userId = u.id')
    .leftJoin('book', 'b', 'l.bookId = b.id')
    .leftJoin('book_info', 'bi', 'b.infoid = bi.id'),
})
export class VLending {
  @ViewColumn()
    id: number;

  @ViewColumn()
    lendingCondition: string;

  @ViewColumn()
    login: string;

  @ViewColumn()
    penaltyDays: number;

  @ViewColumn()
    bookId: number;

  @ViewColumn()
    callSign: string;

  @ViewColumn()
    title: string;

  @ViewColumn()
    image: string;

  @ViewColumn()
    createdAt: Date;

  @ViewColumn()
    returnedAt: Date;

  @ViewColumn()
    dueDate: Date;
}

export default VLending;
