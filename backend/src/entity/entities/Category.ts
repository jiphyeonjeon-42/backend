import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { BookInfo } from './BookInfo';

@Index('id', ['id'], { unique: true })
@Index('name', ['name'], { unique: true })
@Entity('category', { schema: '42library' })
export class Category {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', unique: true, length: 255 })
  name: string;

  @OneToMany("BookInfo", (bookInfo: BookInfo) => bookInfo.category)
  bookInfos: BookInfo[];
}
