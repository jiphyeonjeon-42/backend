import { Repository } from 'typeorm';
import User from '../entity/entities/User';
import jipDataSource from '../app-data-source';
import Lending from '../entity/entities/Lending';
import * as models from '../users/users.model';
import VUserLending from '../entity/entities/VUserLending';
import Book from '../entity/entities/Book';
import Reservation from '../entity/entities/Reservation';
import user from '../entity/entities/User';

class LendingRepository extends Repository<Lending> {
  private readonly userRepo: Repository<User>;

  private readonly userLendingRepo: Repository<VUserLending>;

  private readonly bookRepo: Repository<Book>;

  private readonly reserveRepo: Repository<Reservation>;

  constructor() {
    super(User, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
    this.userRepo = new Repository<User>(
      User,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );

    this.userLendingRepo = new Repository<VUserLending>(
      VUserLending,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );

    this.bookRepo = new Repository<Book>(
      Book,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );

    this.reserveRepo = new Repository<Reservation>(
      Reservation,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner((),
    );
  }

  async searchLending(conditions: {}, limit: number, page: number)
  : Promise<[models.Lending[], number]> {
    const [lendings, count] = await this.findAndCount({
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
    const userLendings = await this.userLendingRepo.findOne({
      select: {
        overDueDay: true,
      },
      where: {
        userId,
      },
    });
    return userLendings!.overDueDay;
  }

  async searchLendingByBookId(bookId: number) {
    const lendings = await this.find({
      relations: { book: true },
      where: {
        book: {
          id: bookId,
        },
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
      relations: [ 'book' ],
      where: {
        status: 0,
        book: {
          id: bookId,
        }
      }
    });
    return reservationList;
  }

  async createLending(userId: number, bookId: number, lendingLibrarianId: number, lendingCondition: string) {
    const lendingData: Lending = this.create({lendingLibrarianId, lendingCondition, bookId, userId});
    await this.save(lendingData);
  }

  async updateReservation(reservationId: number) {
    await this.reserveRepo.update(reservationId, { status: 1 })
  }
}

export default (new LendingRepository());
