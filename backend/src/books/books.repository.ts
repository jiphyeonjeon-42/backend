import { DataSource, Like, Repository } from 'typeorm';
import jipDataSource from '../app-data-source';
import BookInfo from "../entity/entities/BookInfo";
import {SearchBook} from "../entity/entities/SearchBook";

class BooksRepository extends Repository<BookInfo> {
    private readonly searchBook: Repository<SearchBook>;
    constructor() {
        super(BookInfo, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
        this.searchBook = new Repository<SearchBook>(SearchBook, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
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
}

module.exports = new BooksRepository();
