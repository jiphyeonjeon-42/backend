import { ViewEntity, ViewColumn, DataSource } from 'typeorm';
import BookInfo from './BookInfo';
import Reservation from './Reservation';

@ViewEntity({
  expression: (Data: DataSource) => Data
    .createQueryBuilder()
    .select('r.id', 'reservationId')
    .addSelect('r.bookInfoId', 'reservedBookInfoId')
    .addSelect('r.createdAt', 'reservationDate')
    .addSelect('r.endAt', 'endAt')
    .addSelect(
      `(SELECT COUNT(*)
       FROM reservation
       WHERE (status = 0) 
        AND (bookInfoId = reservedBookInfoId) 
        AND (createdAt <= reservationDate))`,
      'ranking',
    )
    .addSelect('bi.title', 'title')
    .addSelect('bi.author', 'author')
    .addSelect('bi.image', 'image')
    .addSelect('r.userId', 'userId')
    .from(Reservation, 'r')
    .leftJoin(BookInfo, 'bi', 'r.bookInfoId = bi.id')
    .where('r.status = 0'),
})
class UserReservation {
  @ViewColumn()
    reservationId: number;

  @ViewColumn()
    reservedBookInfoId: number;

  @ViewColumn()
    reservationDate: Date;

  @ViewColumn()
    endAt: Date;

  @ViewColumn()
    ranking: number;

  @ViewColumn()
    title: string;

  @ViewColumn()
    author: string;

  @ViewColumn()
    image: string;

  @ViewColumn()
    userId: number;
}

export default UserReservation;
