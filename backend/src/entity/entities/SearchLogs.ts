import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SearchKeywords } from './SearchKeywords';

@Index('FK_searchKeywordId', ['searchKeywordId'], {})
@Entity('search_logs')
export class SearchLogs {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id?: number;

  @Column('int', { name: 'search_keyword_id' })
    searchKeywordId?: number;

  @Column('varchar', { name: 'timestamp', length: 255 })
    timestamp?: string;

  @ManyToOne(() => SearchKeywords, (SearchKeyword) => SearchKeyword.id, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'search_keyword_id', referencedColumnName: 'id' }])
    searchKeyword?: SearchKeywords;
}
