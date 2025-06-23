import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { User } from './User';
import type { BookInfo } from './BookInfo';
import type { Book } from './Book';

@Index('FK_bookInfo', ['bookInfoId'], {})
@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('datetime', { name: 'endAt', nullable: true })
  endAt: Date | null;

  @Column('datetime', {
    name: 'createdAt',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column('datetime', {
    name: 'updatedAt',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @Column('int', { name: 'status', default: () => '0' })
  status: number;

  @Column('int', { name: 'bookInfoId' })
  bookInfoId: number;

  @Column('int', { name: 'userId' })
  userId: number;

  @ManyToOne("User", (user: User) => user.reservations, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;

  @ManyToOne("BookInfo", (bookInfo: BookInfo) => bookInfo.reservations, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'bookInfoId', referencedColumnName: 'id' }])
  bookInfo: BookInfo;

  @ManyToOne("Book", (book: Book) => book.reservations, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'bookId', referencedColumnName: 'id' }])
  book: Book;

  @Column('int', { name: 'bookId', nullable: true })
  bookId: number | null;
}
