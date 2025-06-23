import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Book } from './Book';
import type { Lending } from './Lending';
import type { Likes } from './Likes';
import type { Reservation } from './Reservation';
import type { Reviews } from './Reviews';
import type { SubTag } from './SubTag';
import type { SuperTag } from './SuperTag';

@Index('email', ['email'], { unique: true })
@Index('intraId', ['intraId'], { unique: true })
@Index('slack', ['slack'], { unique: true })
@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'email', unique: true, length: 255 })
  email: string;

  @Column('varchar', { name: 'password', length: 255, select: false })
  password: string;

  @Column('varchar', { name: 'nickname', nullable: true, length: 255 })
  nickname: string | null;

  @Column('int', { name: 'intraId', nullable: true, unique: true })
  intraId: number | null;

  @Column('varchar', {
    name: 'slack',
    nullable: true,
    unique: true,
    length: 255,
  })
  slack: string | null;

  @Column('datetime', {
    name: 'penaltyEndDate',
    default: () => 'CURRENT_TIMESTAMP',
  })
  penaltyEndDate: Date;

  @Column('tinyint', { name: 'role', default: () => '0' })
  role: number;

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

  @OneToMany("Book", (book: Book) => book.donator2)
  books: Book[];

  @OneToMany("Lending", (lending: Lending) => lending.user)
  lendings: Lending[];

  @OneToMany("Lending", (lending: Lending) => lending.lendingLibrarian)
  lendings2: Lending[];

  @OneToMany("Lending", (lending: Lending) => lending.returningLibrarian)
  lendings3: Lending[];

  @OneToMany("Likes", (likes: Likes) => likes.user)
  likes: Likes[];

  @OneToMany("Reservation", (reservation: Reservation) => reservation.user)
  reservations: Reservation[];

  @OneToMany("Reviews", (reviews: Reviews) => reviews.user)
  reviews: Reviews[];

  @OneToMany("SubTag", (subtag: SubTag) => subtag.userId)
  subTag: SubTag[];

  @OneToMany("SuperTag", (superTags: SuperTag) => superTags.userId)
  superTags: SuperTag[];
}
