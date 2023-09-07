import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { SuperTag } from './SuperTag';

@Index('userId', ['userId'], {})
@Index('superTagId', ['superTagId'], {})
@Entity('sub_tag', { schema: 'jip_dev' })
export class SubTag {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('int', { name: 'superTagId' })
  superTagId: number;

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

  @Column('tinyint', { name: 'isPublic' })
  isPublic: number;

  @ManyToOne(() => User, (user) => user.subTag, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;

  @ManyToOne(() => SuperTag, (superTag) => superTag.subTags, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'superTagId', referencedColumnName: 'id' }])
  superTag: SuperTag;

  @JoinColumn([{ name: 'bookInfoId', referencedColumnName: 'id' }])
  bookInfoId: number;
}
