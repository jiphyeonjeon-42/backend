import { RowDataPacket } from 'mysql2';

export type BookInfo = RowDataPacket & {
  id?: number;
  title: string;
  author: string;
  publisher: string;
  isbn?: string;
  image: string;
  category: string;
  publishedAt?: string | Date;
  createdAt: Date;
  updatedAt: Date;
}

export type BookEach = RowDataPacket & {
    id?: number;
    donator: string;
    donatorId?: number;
    callSign: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
    infoId: number;
}

export type Book = {
    title: string;
    author: string;
    publisher: string;
    isbn: string;
    image?: string;
    category: string;
    publishedAt?: Date;
    donator?: string;
    callSign: string;
    status: number;
}

export type categoryCount = RowDataPacket & {
    name: string;
    count: number;
}

export type lending = RowDataPacket & {
    lendingCreatedAt: Date;
    returningCreatedAt: Date;
}
