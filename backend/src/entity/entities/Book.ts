import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { BookInfo } from './BookInfo';
import type { User } from './User';
import type { Lending } from './Lending';
import type { Reservation } from './Reservation';

@Index('FK_donator_id_from_user', ['donatorId'], {})
@Entity('book')
export class Book {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('varchar', { name: 'donator', nullable: true, length: 255 })
  donator: string | null;

  @Column('varchar', { name: 'callSign', length: 255 })
  callSign: string;

  @Column('int', { name: 'status' })
  status: number;

  @Column('datetime', {
    name: 'createdAt',
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  createdAt?: Date;

  @Column('int')
  infoId: number;

  @Column('datetime', {
    name: 'updatedAt',
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  updatedAt?: Date;

  @Column('int', { name: 'donatorId', nullable: true })
  donatorId: number | null;

  @ManyToOne("BookInfo", (bookInfo: BookInfo) => bookInfo.books, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'infoId', referencedColumnName: 'id' }])
  info?: BookInfo;

  @ManyToOne("User", (user: User) => user.books, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'donatorId', referencedColumnName: 'id' }])
  donator2?: User;

  @OneToMany("Lending", (lending: Lending) => lending.book)
  lendings?: Lending[];

  @OneToMany("Reservation", (reservation: Reservation) => reservation.book)
  reservations?: Reservation[];
}
