import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookInfo } from './BookInfo';
import { User } from './User';
import { Lending } from './Lending';
import { Reservation } from './Reservation';

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

  @ManyToOne(() => BookInfo, (bookInfo) => bookInfo.books, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'infoId', referencedColumnName: 'id' }])
  info?: BookInfo;

  @ManyToOne(() => User, (user) => user.books, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'donatorId', referencedColumnName: 'id' }])
  donator2?: User;

  @OneToMany(() => Lending, (lending) => lending.book)
  lendings?: Lending[];

  @OneToMany(() => Reservation, (reservation) => reservation.book)
  reservations?: Reservation[];
}
