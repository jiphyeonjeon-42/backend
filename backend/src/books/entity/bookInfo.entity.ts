import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BookInfo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  categoryId!: string;

  @Column()
  title!: string;

  @Column()
  author!: string;

  @Column()
  publisher!: string;

  @Column()
  isbn!: string;

  @Column()
  image!: string;

  @Column()
  publishedAt!: string;

  @Column()
  createdAt!: string;

  @Column()
  updatedAt!: string;
}