import { RowDataPacket } from 'mysql2';

export interface BookInfo extends RowDataPacket {
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

export interface BookEach extends RowDataPacket {
    id?: number;
    donator: string;
    donatorId?: number;
    callSign: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
    infoId: number;
}

export interface Book {
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

export interface categoryCount extends RowDataPacket {
    name: string;
    count: number;
}

export interface lending extends RowDataPacket {
    lendingCreatedAt: Date;
    returningCreatedAt: Date;
}
