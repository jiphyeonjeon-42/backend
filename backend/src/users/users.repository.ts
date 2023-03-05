import { QueryRunner } from 'typeorm/query-runner/QueryRunner';
import { Repository } from 'typeorm';
import Reservation from '../entity/entities/Reservation';
import UserReservation from '../entity/entities/UserReservation';
import * as models from './users.model';
import { formatDate } from '../utils/dateFormat';
import VUserLending from '../entity/entities/VUserLending';
import VLendingForSearchUser from '../entity/entities/VLendingForSearchUser';
import User from '../entity/entities/User';
import jipDataSource from '../app-data-source';

export default class UsersRepository extends Repository<User> {
  private readonly userLendingRepo: Repository<VUserLending>;

  private readonly lendingForSearchUserRepo: Repository<VLendingForSearchUser>;

  private readonly reservationsRepo: Repository<Reservation>;

  private readonly userReservRepo: Repository<UserReservation>;

  constructor(
    queryRunner?: QueryRunner,
  ) {
    const qr = queryRunner;
    const manager = jipDataSource.createEntityManager(qr);
    super(User, manager);
    this.userLendingRepo = new Repository<VUserLending>(
      VUserLending,
      manager,
    );
    this.lendingForSearchUserRepo = new Repository<VLendingForSearchUser>(
      VLendingForSearchUser,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner(),
    );
    this.reservationsRepo = new Repository<Reservation>(
      Reservation,
      manager,
    );
    this.userReservRepo = new Repository<UserReservation>(
      UserReservation,
      manager,
    );
  }

  async searchUserBy(conditions: {}, limit: number, page: number)
  : Promise<[models.User[], number]> {
    const [users, count] = await this.findAndCount({
      select: [
        'id',
        'email',
        'nickname',
        'intraId',
        'slack',
        'penaltyEndDate',
        'role',
      ],
      where: conditions,
      take: limit,
      skip: page * limit,
    });
    const customUsers = users as unknown as models.User[];
    customUsers.forEach((user) => {
      const penaltyEndDate: Date = user.penaltyEndDate as Date;
      const formattedPenaltyEndDate: String = formatDate(penaltyEndDate);
      user.penaltyEndDate = formattedPenaltyEndDate as unknown as Date;
    });
    return [customUsers, count];
  }

  async getLending(users: { userId: number; }[]) {
    if (users.length !== 0) return this.userLendingRepo.find({ where: users });
    return this.userLendingRepo.find();
  }

  async countReservations(bookInfoId: number) {
    const count = await this.reservationsRepo.count({
      where: {
        bookInfoId,
      },
    });
    return count;
  }

  async getUserLendings(userId: number) {
    const userLendingList = await this.lendingForSearchUserRepo.find({
      where: {
        userId,
      },
    }) as unknown as models.Lending[];
    return userLendingList;
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
