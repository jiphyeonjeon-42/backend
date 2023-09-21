import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BookInfo } from './BookInfo';

@Index('FK_bookInfoId', ['bookInfoId'], {})
@Entity('book_info_search_keywords')
export class BookInfoSearchKeywords {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('varchar', { name: 'disassembled_title', length: 255 })
  disassembledTitle?: string;

  @Column('varchar', { name: 'disassembled_author', length: 255 })
  disassembledAuthor?: string;

  @Column('varchar', { name: 'disassembled_publisher', length: 255 })
  disassembledPublisher?: string;

  @Column('varchar', { name: 'title_initials', length: 255 })
  titleInitials?: string;

  @Column('varchar', { name: 'author_initials', length: 255 })
  authorInitials?: string;

  @Column('varchar', { name: 'publisher_initials', length: 255 })
  publisherInitials?: string;

  @Column('int', { name: 'book_info_id' })
  bookInfoId?: number;

  @OneToOne(() => BookInfo, (bookInfo) => bookInfo.id)
  @JoinColumn([{ name: 'book_info_id', referencedColumnName: 'id' }])
  bookInfo?: BookInfo;
}
