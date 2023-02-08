import {
  IsNull, QueryRunner, Repository, UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import User from '../entity/entities/User';
import jipDataSource from '../app-data-source';
import Lending from '../entity/entities/Lending';
import * as models from '../users/users.model';
import VUserLending from '../entity/entities/VUserLending';
import Book from '../entity/entities/Book';
import Reservation from '../entity/entities/Reservation';
import VLending from '../entity/entities/VLending';
import { formatDate } from '../utils/dateFormat';

class LendingRepository extends Repository<Lending> {
  private readonly userRepo: Repository<User>;

  private readonly userLendingRepo: Repository<VUserLending>;

  private readonly bookRepo: Repository<Book>;

  private readonly reserveRepo: Repository<Reservation>;

  private readonly vlendingRepo: Repository<VLending>;

  private transactionQueryRunner: null | QueryRunner;

  constructor(queryRunner: null | QueryRunner) {
    super(Lending, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
    if (queryRunner) {
      this.transactionQueryRunner = queryRunner;
    } else {
      this.transactionQueryRunner = jipDataSource.createQueryRunner();
    }
    const entityManager = jipDataSource.createEntityManager(this.transactionQueryRunner);

    this.userRepo = new Repository<User>(
      User,
      entityManager,
    );

    this.userLendingRepo = new Repository<VUserLending>(
      VUserLending,
      entityManager,
    );

    this.bookRepo = new Repository<Book>(
      Book,
      entityManager,
    );

    this.reserveRepo = new Repository<Reservation>(
      Reservation,
      entityManager,
    );

    this.vlendingRepo = new Repository<VLending>(
      VLending,
      entityManager,
    );
  }

  async searchLending(conditions: {}, limit: number, page: number)
  : Promise<[models.Lending[], number]> {
    const [lendings, count] = await this.userLendingRepo.findAndCount({
      where: conditions,
      take: limit,
      skip: page * limit,
    });
    const customLendings = lendings as unknown as models.Lending[];
    return [customLendings, count];
  }

  async getUsersPenalty(userId: number) {
    const users = await this.userRepo.findOne({
      select: {
        penaltyEndDate: true,
      },
      where: {
        id: userId,
      },
    });
    return users!.penaltyEndDate;
  }

  async getUsersOverDueDay(userId: number) {
    const overDueDay = await this.userLendingRepo.findOne({
      select: {
        overDueDay: true,
      },
      where: {
        userId,
      },
    });
    return overDueDay;
  }

  async getLendingCountByBookId(bookId: number) {
    const count = await this.count({
      relations: ['book'],
      where: {
        book: {
          id: bookId,
        },
        returnedAt: IsNull(),
      },
    });
    return lendings as unknown as models.Lending[];
  }

  async searchBookForLending(bookId: number) {
    const book = await this.bookRepo.findOne({
      where: {
        id: bookId,
      },
    });
    return book;
  }

  async searchReservationByBookId(bookId: number) {
    const reservationList = await this.reserveRepo.findOne({
      relations: ['book', 'user'],
      where: {
        status: 0,
        book: {
          id: bookId,
        },
      },
    });
    return reservationList;
  }

  async createLending(
    userId: number,
    bookId: number,
    lendingLibrarianId: number,
    lendingCondition: string,
    transaction: QueryRunner | null = this.transactionQueryRunner,
  ): Promise<void> {
    const lendingObject = {
      lendingLibrarianId,
      lendingCondition,
      bookId,
      userId,
    };
    if (transaction) {
      await transaction.manager.save(Lending, lendingObject);
    } else {
      await this.save(lendingObject);
    }
  }

  async updateLending(
    returningLibrarianId: number | null,
    returningCondition: string | null,
    lendingId: number,
    transaction: QueryRunner | null = this.transactionQueryRunner,
  ): Promise<void> {
    const updateObject: QueryDeepPartialEntity<Lending> = {
      returningLibrarianId,
      returningCondition,
      returnedAt: (new Date()),
    };
    if (transaction) {
      await transaction.manager.update(Lending, lendingId, updateObject);
    } else {
      await this.update(lendingId, updateObject);
    }
  }

  async updateUserPenaltyEndDate(
    penaltyEndDate: string,
    id: number,
    transaction: QueryRunner | null = this.transactionQueryRunner,
  ): Promise<void> {
    const updateObject: QueryDeepPartialEntity<User> = {
      penaltyEndDate,
    };
    if (transaction) {
      await transaction.manager.update(User, id, updateObject);
    } else {
      await this.userRepo.update(id, updateObject);
    }
  }

  async searchReservedBook(
    bookInfoId: number,
  ): Promise<Reservation | null> {
    const reservation = await this.reserveRepo.findOne({
      relations: ['book', 'user', 'bookInfo'],
      where: {
        status: 0,
        bookInfoId,
        bookId: IsNull(),
      },
    });
    return reservation;
  }

  async updateReservationEndDate(
    bookId: number | undefined,
    reservationId: number,
    transaction: QueryRunner | null = this.transactionQueryRunner,
  ): Promise<UpdateResult> {
    const endAt = new Date();
    endAt.setDate(endAt.getDate() + 3);
    const updateObject: QueryDeepPartialEntity<Reservation> = {
      bookId,
      endAt: formatDate(endAt),
    };
    let result;
    if (transaction) {
      result = await transaction.manager.update(Reservation, reservationId, updateObject);
    } else {
      result = await this.reserveRepo.update(reservationId, updateObject);
    }
    return result;
  }

  async updateReservationToLended(
    reservationId: number,
    transaction: QueryRunner | null = this.transactionQueryRunner,
  ): Promise<void> {
    if (transaction) {
      await transaction.manager.update(Reservation, reservationId, { status: 1 });
    } else {
      await this.reserveRepo.update(reservationId, { status: 1 });
    }
  }

  async searchLendingForUser(conditions: {}, limit: number, page: number, order: {})
  : Promise<[VLending[], number]> {
    const [lending, count] = await this.vlendingRepo.findAndCount({
      select: [
        'id',
        'lendingCondition',
        'login',
        'penaltyDays',
        'callSign',
        'title',
        'image',
        'createdAt',
        'duedate',
      ],
      where: conditions,
      take: limit,
      skip: limit * page,
      order,
    });
    return [lending, count];
  }

  async startTransaction() {
    if (!this.transactionQueryRunner) {
      this.transactionQueryRunner = jipDataSource.createQueryRunner();
    }
    await this.transactionQueryRunner.startTransaction();
  }

  async commitTransaction() {
    if (this.transactionQueryRunner) {
      await this.transactionQueryRunner.commitTransaction();
    }
  }

  async rollbackTransaction() {
    if (this.transactionQueryRunner) {
      await this.transactionQueryRunner.rollbackTransaction();
    }
  }

  async release() {
    if (this.transactionQueryRunner) {
      await this.transactionQueryRunner.release();
      this.transactionQueryRunner = null;
    }
  }
}

export default LendingRepository;
