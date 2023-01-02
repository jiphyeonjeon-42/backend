import { Repository } from 'typeorm';
import User from '../entity/entities/User';
import jipDataSource from '../app-data-source';
import Reservation from '../entity/entities/Reservation';
import UserReservation from '../entity/entities/UserReservation';
import * as models from './users.model';
import { formatDate } from '../utils/dateFormat';
import GetLending from '../entity/entities/GetLending';

class UsersRepository extends Repository<User> {
  private readonly getLendingRepo: Repository<GetLending>;

  private readonly reservationsRepo: Repository<Reservation>;

  private readonly userReservRepo: Repository<UserReservation>;

  constructor() {
    super(User, jipDataSource.createEntityManager(), jipDataSource.createQueryRunner());
    this.getLendingRepo = new Repository<GetLending>(
      GetLending,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );
    this.reservationsRepo = new Repository<Reservation>(
      Reservation,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );
    this.userReservRepo = new Repository<UserReservation>(
      UserReservation,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );
  }

  async searchUserBy(conditions: {}, limit: number, page: number)
  : Promise<[models.User[], number]> {
    const [users, count] = await this.findAndCount({
      where: conditions,
      take: limit,
      skip: page * limit,
    });
    const customUsers = users as unknown as models.User[];
    return [customUsers, count];
  }

  async getLending() {
    const lendings = await this.getLendingRepo.find();
    return lendings;
  }

  async countReservations(bookInfoId: number) {
    const count = await this.reservationsRepo.count({
      where: {
        bookInfoId,
      },
    });
    return count;
  }

  async getUserReservations(userId: number) {
    const userReservList = await this.userReservRepo.find({
      where: {
        userId,
      },
    });
    return userReservList;
  }

  async insertUser(email: string, password: string) {
    const penaltyEndDate = new Date(0);
    penaltyEndDate.setDate(penaltyEndDate.getDate() - 1);
    this.insert({
      email,
      password,
      penaltyEndDate: formatDate(penaltyEndDate),
    });
  }

  async updateUser(id: number, values: {})
  : Promise<models.User> {
    const updatedUser = await this.update(
      id,
      values,
    ) as unknown as models.User;
    return updatedUser;
  }
}

export default (new UsersRepository());
