import {
  Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import Book from './Book';
import Category from './Category';
import Likes from './Likes';
import Reservation from './Reservation';
import Reviews from './Reviews';

@Index('categoryId', ['categoryId'], {})
@Entity('book_info')
class BookInfo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('varchar', { name: 'title', length: 255 })
  title?: string;

  @Column('varchar', { name: 'author', length: 255 })
  author?: string;

  @Column('varchar', { name: 'publisher', length: 255 })
  publisher?: string;

  @Column('varchar', { name: 'isbn', nullable: true, length: 255 })
  isbn?: string | null;

  @Column('varchar', { name: 'image', nullable: true, length: 255 })
  image?: string | null;

  @Column('date', { name: 'publishedAt', nullable: true })
  publishedAt?: string | null;

  @Column('datetime', {
    name: 'createdAt',
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  createdAt?: Date;

  @Column('datetime', {
    name: 'updatedAt',
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  updatedAt?: Date;

  @Column('int', { name: 'categoryId' })
  categoryId?: number;

  @OneToMany(() => Book, (book) => book.info)
  books?: Book[];

  @ManyToOne(() => Category, (category) => category.bookInfos, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'categoryId', referencedColumnName: 'id' }])
  category?: Category;

  @OneToMany(() => Likes, (likes) => likes.bookInfo)
  likes?: Likes[];

  @OneToMany(() => Reservation, (reservation) => reservation.bookInfo)
  reservations?: Reservation[];

  @OneToMany(() => Reviews, (reviews) => reviews.bookInfo)
  reviews?: Reviews[];
}

export default BookInfo;
