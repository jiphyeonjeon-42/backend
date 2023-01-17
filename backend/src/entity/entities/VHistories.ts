import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: (Data: DataSource) => Data
    .createQueryBuilder()
    .select('lending.id', 'id')
    .addSelect('lendingCondition')
    .addSelect('user.nickname', 'login')
    .addSelect('lending.returningCondition')
    .addSelect(`
      CASE WHEN NOW() > user.penalyEndDate THEN 0
        ELSE DATEDIFF(user.penaltyEndDate, NOW())
    `, 'penaltyDays')
    .addSelect('book.callSign')
    .addSelect('book_info.title')
    .addSelect('book_info.id', 'bookInfoId')
    .addSelect('book_info.image', 'image')
    .addSelect('DATE_FORMAT(lending.createdAt, "%Y-%m-%d")', 'createdAt')
    .addSelect('DATE_FORMAT(lending.returnedAt, "%Y-%m-%d")', 'returnedAt')
    .addSelect('DATE_ADD(lending.createdAt, interval 14 day), \'%Y-%m-%d\')', 'dueDate')
    .addSelect('SELECT nickname from user WHERE user.id = lendingLibrarianId', 'lendingLibrarianNickName')
    .addSelect('SELECT nickname FROM user WHERE user.id = returningLibrarianId', 'returningLibrarianNickname')
    .from('lending', 'l')
    .innerJoin('user', 'u', 'l.userId = u.id')
    .innerJoin('book', 'b', 'l.bookId = b.id')
    .leftJoin('book_info', 'bi', 'b.infoId = bi.id')
    .where('l.returnedAt IS NULL'),
})
export default class VHistories {
  @ViewColumn()
  id: string;

  @ViewColumn()
  lendingCondition: string;

  @ViewColumn()
  login: string;

  @ViewColumn()
  returningCondition: string;

  @ViewColumn()
  penaltyDays: number;

  @ViewColumn()
  callSign: string;

  @ViewColumn()
  title: string;

  @ViewColumn()
  bookInfoId: number;

  @ViewColumn()
  image: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  returnedAt: Date;

  @ViewColumn()
  dueDate: Date;

  @ViewColumn()
  lendingLibrarianNickName: string;

  @ViewColumn()
  returningLibrarianNickname: string;
}
