import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Book } from './Book';
import type { Category } from './Category';
import type { Likes } from './Likes';
import type { Reservation } from './Reservation';
import type { Reviews } from './Reviews';
import type { SuperTag } from './SuperTag';
import type { BookInfoSearchKeywords } from './BookInfoSearchKeywords';

@Index('categoryId', ['categoryId'], {})
@Entity('book_info')
export class BookInfo {
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

  @OneToMany("Book", (book: Book) => book.info)
  books?: Book[];

  @ManyToOne("Category", (category: Category) => category.bookInfos, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'categoryId', referencedColumnName: 'id' }])
  category?: Category;

  @OneToMany("Likes", (likes: Likes) => likes.bookInfo)
  likes?: Likes[];

  @OneToMany("Reservation", (reservation: Reservation) => reservation.bookInfo)
  reservations?: Reservation[];

  @OneToMany("Reviews", (reviews: Reviews) => reviews.bookInfo)
  reviews?: Reviews[];

  @OneToMany("SuperTag", (superTags: SuperTag) => superTags.userId)
  superTags?: SuperTag[];

  @OneToOne("BookInfoSearchKeywords", (bookInfoSearchKeyword: BookInfoSearchKeywords) => bookInfoSearchKeyword.bookInfo)
  bookInfoSearchKeyword?: BookInfoSearchKeywords;
}
