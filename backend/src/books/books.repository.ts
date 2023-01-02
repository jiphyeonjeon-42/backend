import { Like, Repository } from 'typeorm';
import jipDataSource from '../app-data-source';
import {SearchBook} from "../entity/entities/SearchBook";
import Book from "../entity/entities/Book";
import * as errorCode from '../utils/error/errorCode';
import BookInfo from "../entity/entities/BookInfo";
import Lending from "../entity/entities/Lending";

    class BooksRepository {
    private readonly searchBook: Repository<SearchBook>;
    private readonly books: Repository<Book>;
    private readonly bookInfo: Repository<BookInfo>
    constructor() {
        this.searchBook = new Repository<SearchBook>(SearchBook, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
        this.books = new Repository<Book>(Book, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
        this.bookInfo = new Repository<BookInfo>(BookInfo, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
        console.log('book repo init');
    }

    async getBookList(condition: string, limit: number, page: number) {
        return await this.searchBook.find({
            where: [
                {title: Like(`%${condition}%`)},
                {author: Like(`%${condition}%`)},
                {isbn: Like(`%${condition}%`)},
            ],
            take: limit,
            skip: page * limit,
        });
    }

    async getTotalItems(condition: string) {
        return await this.searchBook.find({
            select: {bookId: true},
            where: [
                {title: Like(`%${condition}%`)},
                {author: Like(`%${condition}%`)},
                {isbn: Like(`%${condition}%`)},
            ],
        }).then(res => res.length);
    }
    // TODO: support variable repo.
    async findOneById(id: string) {
        return await this.searchBook.findOneBy({bookId: Number(id)}).then(res => {
            if (!res)
                throw new Error(errorCode.NO_BOOK_ID);
            return res;
        });
    }

    // TODO: refactact sort type
    async getLendingBookList(sort: string, limit: number) {
        const orderingArr: {sort: string, order: 'ASC'|'DESC'}[] = [{sort: 'createdAt', order: 'DESC'} , {sort: 'lendingCnt', order: 'DESC'}];
        const ordering: any = (sort === "popular" ? orderingArr[1] : orderingArr[0]);
        const lendingCondition: string = sort === "popular" ? "lending.createdAt >= date_sub(now(), interval 42 day" : "";

        const lendingBookList = this.bookInfo.createQueryBuilder()
            .select("book_info.id", "id")
            .addSelect("book_info.title", "title")
            .addSelect("book_info.author", "author")
            .addSelect("book_info.publisher", "publisher")
            .addSelect("book_info.isbn", "isbn")
            .addSelect("book_info.image", "image")
            .addSelect("category.name", "category")
            .addSelect("book_info.createdAt", "createdAt")
            .addSelect("book_info.updatedAt", "updatedAt")
            .addSelect("COUNT(lending.id)", "lendingCnt")
            .groupBy("book_info.id")
            .from(BookInfo, "book_info")
            .leftJoin(Book, "Book", "book.infoId = bookInfo.id")
            .leftJoin(Lending, "lending", "lending.bookId = book.id")
            .skip(limit)
            .orderBy(ordering)
            .where(lendingCondition)
            .getMany();
        return lendingBookList;

        // return await this.bookInfo.find(
        //     {
        //         relations: {
        //             Lending: true,
        //         },
        //         take: limit,
        //         order : sort === "popular" ? oriding[1] : oriding[0],
        //     },
        // )
    }
}

module.exports = new BooksRepository();
