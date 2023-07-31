import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity('v_lending_for_search_user', {
  expression: (Data: DataSource) => Data
    .createQueryBuilder()
    .addSelect('u.id', 'userId')
    .addSelect('bi.id', 'bookInfoId')
    .addSelect('l.createdAt', 'lendDate')
    .addSelect('l.lendingCondition', 'lendingCondition')
    .addSelect('bi.image', 'image')
    .addSelect('bi.author', 'author')
    .addSelect('bi.title', 'title')
    .addSelect('DATE_ADD(l.createdAt, INTERVAL 14 DAY)', 'duedate')
    .addSelect('CASE WHEN DATEDIFF(now(), DATE_ADD(l.createdAt, INTERVAL 14 DAY)) < 0 THEN 0 ELSE DATEDIFF(now(), DATE_ADD(l.createdAt, INTERVAL 14 DAY)) END', 'overDueDay')
    .addSelect('(SELECT COUNT(r.id) FROM reservation r WHERE r.bookInfoId = bi.id AND r.status = 0)', 'reservedNum')
    .from('lending', 'l')
    .where('l.returnedAt is NULL')
    .innerJoin('user', 'u', 'l.userId = u.id')
    .leftJoin('book', 'b', 'l.bookId = b.id')
    .leftJoin('book_info', 'bi', 'b.infoid = bi.id'),
})
export class VLendingForSearchUser {
  @ViewColumn()
    userId: number;

  @ViewColumn()
    bookInfoId: number;

  @ViewColumn()
    lendDate: Date;

  @ViewColumn()
    lendingCondition: string;

  @ViewColumn()
    image: string;

  @ViewColumn()
    author: string;

  @ViewColumn()
    title: string;

  @ViewColumn()
    duedate: Date;

  @ViewColumn()
    overDueDay: Date;

  @ViewColumn()
    reservedNum: number;
}
