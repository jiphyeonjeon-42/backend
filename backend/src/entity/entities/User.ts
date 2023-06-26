import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import Book from './Book';
import Lending from './Lending';
import Likes from './Likes';
import Reservation from './Reservation';
import Reviews from './Reviews';
import SubTag from './SubTag';
import SuperTag from './SuperTag';

@Index('email', ['email'], { unique: true })
@Index('intraId', ['intraId'], { unique: true })
@Index('slack', ['slack'], { unique: true })
@Entity('user')
class User {
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

  @OneToMany(() => Book, (book) => book.donator2)
  books: Relation<Book[]>;

  @OneToMany(() => Lending, (lending) => lending.user)
  lendings: Relation<Lending[]>;

  @OneToMany(() => Lending, (lending) => lending.lendingLibrarian)
  lendings2: Relation<Lending[]>;

  @OneToMany(() => Lending, (lending) => lending.returningLibrarian)
  lendings3: Relation<Lending[]>;

  @OneToMany(() => Likes, (likes) => likes.user)
  likes: Relation<Likes[]>;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Relation<Reservation[]>;

  @OneToMany(() => Reviews, (reviews) => reviews.user)
  reviews: Relation<Reviews[]>;

  @OneToMany(() => SubTag, (subtag) => subtag.userId)
  subTag: Relation<SubTag[]>;

  @OneToMany(() => SuperTag, (superTags) => superTags.userId)
  superTags: Relation<SuperTag[]>;
}

export default User;
