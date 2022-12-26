import BookInfo from "./BookInfo";
import Book from "./Book";
import {DataSource, ViewColumn, ViewEntity} from "typeorm";

@ViewEntity({
    expression: (Data: DataSource) => Data
        .createQueryBuilder()
        .select("book_info.id", "bookInfoId")
        .addSelect("book_info.title", "title")
        .addSelect("book_info.author", "author")
        .addSelect("book_info.publisher", "publisher")
        .addSelect("DATE_FORMAT(book_info.publishedAt, '%Y%m%d')", "publishedAt")
        .addSelect("book_info.isbn", "isbn")
        .addSelect("book_info.image", "image")
        .addSelect("book.callSign", "callSign")
        .addSelect("book.id", "bookId")
        .addSelect("book.status", "status")
        .addSelect("book_info.categoryId", "categoryId")
        .from(BookInfo, "book_info")
        .addFrom(Book, "book")
})
export class SearchBook {
    @ViewColumn()
    bookInfoId!: number;

    @ViewColumn()
    title!: string;

    @ViewColumn()
    author!: string;

    @ViewColumn()
    publisher!: string;

    @ViewColumn()
    publishedAt!: string;

    @ViewColumn()
    isbn!: string;

    @ViewColumn()
    image!: string;

    @ViewColumn()
    bookId!: number;

    @ViewColumn()
    status!: number;

    @ViewColumn()
    categoryId!: string;
}
