import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from './User';
import BookInfo from './BookInfo';

// @Index('FK_529dceb01ef681127fef04d755d4', ['userId'], {})
// @Index('FK_bookInfo3', ['bookInfoId'], {})
@Entity('likes', { schema: '42library' })

class Likes {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('int', { name: 'bookInfoId' })
  bookInfoId: number;

  @Column('tinyint', { name: 'isDeleted', width: 1, default: () => "'0'" })
  isDeleted: boolean;

  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;

  @ManyToOne(() => BookInfo, (bookInfo) => bookInfo.likes, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'bookInfoId', referencedColumnName: 'id' }])
  bookInfo: BookInfo;
}

export default Likes;
