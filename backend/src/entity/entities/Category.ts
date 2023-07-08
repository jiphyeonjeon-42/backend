import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import BookInfo from './BookInfo';

@Index('id', ['id'], { unique: true })
@Index('name', ['name'], { unique: true })
@Entity('category', { schema: '42library' })
class Category {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

  @Column('varchar', { name: 'name', unique: true, length: 255 })
    name: string;

  @OneToMany(() => BookInfo, (bookInfo) => bookInfo.category)
    bookInfos: BookInfo[];
}

export default Category;
