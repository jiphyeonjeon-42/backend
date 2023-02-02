import { QueryRunner, Repository } from 'typeorm';
import jipDataSource from '../app-data-source';
import BookInfo from '../entity/entities/BookInfo';
import User from '../entity/entities/User';
import Lending from '../entity/entities/Lending';

class ReservationsRepository {
  private readonly bookInfo: Repository<BookInfo>;

  private readonly user: Repository<User>;

  private readonly lending: Repository<Lending>;

  private transactionQueryRunner: QueryRunner | null;

  constructor() {
    this.transactionQueryRunner = null;
    const queryRunner = jipDataSource.createQueryRunner();
    const entityManager = jipDataSource.createEntityManager(queryRunner);

    this.bookInfo = new Repository<BookInfo>(
      BookInfo,
      entityManager,
    );
    this.user = new Repository<User>(
      User,
      entityManager,
    );
    this.lending = new Repository<Lending>(
      Lending,
      entityManager,
    );
  }

  async startTransaction(): Promise<void> {
    if (!this.transactionQueryRunner) {
      this.transactionQueryRunner = jipDataSource.createQueryRunner();
      await this.transactionQueryRunner.startTransaction();
    }
  }

  // 유저가 연체 패널티인지 확인

  // 현재 대출 중인 책이 연체 중인지 확인

  // bookinfoid 가 전부 대출되어있는지 확인

  // bookinfoid
}

export default new ReservationsRepository();
