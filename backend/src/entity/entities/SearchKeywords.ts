import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SearchLogs } from './SearchLogs';

@Entity('search_keywords')
export class SearchKeywords {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('varchar', { name: 'keyword', length: 255 })
  keyword?: string;

  @Column('varchar', { name: 'disassembled_keyword', length: 255 })
  disassembledKeyword?: string;

  @Column('varchar', { name: 'initial_consonants', length: 255 })
  initialConsonants?: string;

  @OneToMany(() => SearchLogs, (searchLogs) => searchLogs.searchKeyword)
  searchLogs?: SearchLogs[];
}
