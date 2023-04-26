import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import SubTag from './SubTag';
import User from './User';
import BookInfo from './BookInfo';

@Index('userId', ['userId'], {})
@Index('bookInfoId', ['bookInfoId'], {})
@Entity('super_tag', { schema: 'jip_dev' })
export default class SuperTag {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('int', { name: 'bookInfoId' })
  bookInfoId: number;

  @Column('datetime', {
    name: 'createdAt',
    default: () => 'current_timestamp(6)',
  })
  createdAt: Date;

  @Column('datetime', {
    name: 'updatedAt',
    default: () => 'current_timestamp(6)',
  })
  updatedAt: Date;

  @Column('tinyint', { name: 'isDeleted', default: () => '0' })
  isDeleted: number;

  @Column('int', { name: 'updateUserId' })
  updateUserId: number;

  @Column('varchar', { name: 'content', length: 42 })
  content: string;

  @OneToMany(() => SubTag, (subTag) => subTag.superTag)
  subTags: SubTag[];

  @ManyToOne(() => User, (user) => user.superTags, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;

  @ManyToOne(() => BookInfo, (bookInfo) => bookInfo.superTags, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'bookInfoId', referencedColumnName: 'id' }])
  bookInfo: BookInfo;
}
