import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

// TODO: 대출자 id로 검색 가능하게
@ViewEntity({
  expression: (Data: DataSource) =>
    Data.createQueryBuilder()
      .select('l.id', 'id')
      .addSelect('lendingCondition', 'lendingCondition')
      .addSelect('u.nickname', 'login')
      .addSelect('l.returningCondition', 'returningCondition')
      .addSelect(
        `
      CASE WHEN NOW() > u.penaltyEndDate THEN 0
        ELSE DATEDIFF(u.penaltyEndDate, NOW()) END
    `,
        'penaltyDays',
      )
      .addSelect('b.callSign', 'callSign')
      .addSelect('bi.title', 'title')
      .addSelect('bi.id', 'bookInfoId')
      .addSelect('bi.image', 'image')
      .addSelect('DATE_FORMAT(l.createdAt, "%Y-%m-%d")', 'createdAt')
      .addSelect('DATE_FORMAT(l.returnedAt, "%Y-%m-%d")', 'returnedAt')
      .addSelect('DATE_FORMAT(l.updatedAt, "%Y-%m-%d")', 'updatedAt')
      .addSelect("DATE_FORMAT(DATE_ADD(l.createdAt, interval 14 day), '%Y-%m-%d')", 'dueDate')
      .addSelect(
        '(SELECT nickname FROM user WHERE user.id = lendingLibrarianId)',
        'lendingLibrarianNickName',
      )
      .addSelect(
        '(SELECT nickname FROM user WHERE user.id = returningLibrarianId)',
        'returningLibrarianNickname',
      )
      .from('lending', 'l')
      .innerJoin('user', 'u', 'l.userId = u.id')
      .innerJoin('book', 'b', 'l.bookId = b.id')
      .leftJoin('book_info', 'bi', 'b.infoId = bi.id'),
})
export class VHistories {
  @ViewColumn()
  id: number;

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
  updatedAt: Date;

  @ViewColumn()
  dueDate: Date;

  @ViewColumn()
  lendingLibrarianNickName: string;

  @ViewColumn()
  returningLibrarianNickname: string;
}
