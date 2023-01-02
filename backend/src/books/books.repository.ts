import { Like, Repository } from 'typeorm';
import jipDataSource from '../app-data-source';
import {SearchBook} from "../entity/entities/SearchBook";
import Book from "../entity/entities/Book";
import * as errorCode from '../utils/error/errorCode';

class BooksRepository {
    private readonly searchBook: Repository<SearchBook>;
    private readonly books: Repository<Book>;
    constructor() {
        this.searchBook = new Repository<SearchBook>(SearchBook, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
        this.books = new Repository<Book>(Book, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
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

    async findOneById(id: string) {
        return await this.searchBook.findOneBy({bookId: Number(id)}).then(res => {
            if (!res)
                throw new Error(errorCode.NO_BOOK_ID);
            return res;
        });
    }
}

module.exports = new BooksRepository();
