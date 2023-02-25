import {
  IsNull, MoreThan, QueryRunner, Repository, UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import User from '../entity/entities/User';
import jipDataSource from '../app-data-source';
import Lending from '../entity/entities/Lending';
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

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(Lending, entityManager);

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

  async searchLendingCount(conditions: {}, limit: number, page: number) {
    const count = await this.userLendingRepo.count({
      where: conditions,
      take: limit,
      skip: page * limit,
    });
    return count;
  }

  async searchLending(conditions: {}, limit: number, page: number, order: {})
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
        'dueDate',
      ],
      where: conditions,
      take: limit,
      skip: limit * page,
      order,
    });
    return [lending, count];
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
        overDueDay: MoreThan(0),
      },
    });
    return overDueDay?.overDueDay;
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
    return count;
  }

  async searchBookForLending(bookId: number) {
    const book = await this.bookRepo.findOne({
      relations: ['info'],
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
  ): Promise<void> {
    const lendingObject = {
      lendingLibrarianId,
      lendingCondition,
      bookId,
      userId,
    };
    await this.save(lendingObject);
  }

  async updateLending(
    returningLibrarianId: number | null,
    returningCondition: string | null,
    lendingId: number,
  ): Promise<void> {
    const updateObject: QueryDeepPartialEntity<Lending> = {
      returningLibrarianId,
      returningCondition,
      returnedAt: (new Date()),
    };
    await this.update(lendingId, updateObject);
  }

  async updateUserPenaltyEndDate(
    penaltyEndDate: string,
    id: number,
  ): Promise<void> {
    const updateObject: QueryDeepPartialEntity<User> = {
      penaltyEndDate,
    };
    await this.userRepo.update(id, updateObject);
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
  ): Promise<UpdateResult> {
    const endAt = new Date();
    endAt.setDate(endAt.getDate() + 3);
    const updateObject: QueryDeepPartialEntity<Reservation> = {
      bookId,
      endAt: formatDate(endAt),
    };
    return this.reserveRepo.update(reservationId, updateObject);
  }

  async updateReservationToLended(
    reservationId: number,
  ): Promise<void> {
    await this.reserveRepo.update(reservationId, { status: 1 });
  }
}

export default LendingRepository;
