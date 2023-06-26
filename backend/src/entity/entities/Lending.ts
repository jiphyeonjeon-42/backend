import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import Book from './Book';
import User from './User';

 @Index('FK_f2adde8c7d298210c39c500d966', ['lendingLibrarianId'], {})
 @Index('FK_returningLibrarianId', ['returningLibrarianId'], {})
@Entity('lending', { schema: '42library' })

class Lending {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'lendingLibrarianId' })
  lendingLibrarianId: number;

  @Column('varchar', { name: 'lendingCondition', length: 255 })
  lendingCondition: string;

  @Column('int', { name: 'returningLibrarianId', nullable: true })
  returningLibrarianId: number | null;

  @Column('varchar', {
    name: 'returningCondition',
    nullable: true,
    length: 255,
  })
  returningCondition: string | null;

  @Column('datetime', { name: 'returnedAt', nullable: true })
  returnedAt: Date | null;

  @Column('timestamp', {
    name: 'createdAt',
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  createdAt: Date;

  @Column('timestamp', {
    name: 'updatedAt',
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  updatedAt: Date;

  @ManyToOne(() => Book, (book) => book.lendings, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'bookId', referencedColumnName: 'id' }])
  book: Relation<Book>;

  @Column({ name: 'bookId', type: 'int' })
  bookId: number;

  @ManyToOne(() => User, (user) => user.lendings, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Relation<User>;

  @Column({ name: 'userId', type: 'int' })
  userId: number;

  @ManyToOne(() => User, (user) => user.lendings2, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'lendingLibrarianId', referencedColumnName: 'id' }])
  lendingLibrarian: Relation<User>;

  @ManyToOne(() => User, (user) => user.lendings3, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'returningLibrarianId', referencedColumnName: 'id' }])
  returningLibrarian: Relation<User>;
 }

export default Lending;
