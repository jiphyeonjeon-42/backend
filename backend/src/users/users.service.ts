import { Like, Not } from 'typeorm';
import * as errorCode from '../utils/error/errorCode';
import * as models from './users.model';
import * as types from './users.type';
import UsersRepository from './users.repository';

export default class UsersService {
  private readonly usersRepository : UsersRepository;

  constructor() {
    this.usersRepository = new UsersRepository();
  }

  async setOverDueDay(items: models.User[]): Promise<models.User[]> {
    const usersIdList = items.map((user: models.User) => ({ userId: user.id }));
    const lending = await this.usersRepository
      .getLending(usersIdList) as unknown as models.Lending[];
    if (items) {
      return items.map((item: models.User) => {
        const rtnObj: models.User = Object.assign(item);
        rtnObj.lendings = lending.filter((lend) => lend.userId === item.id);
        rtnObj.overDueDay = 0;
        if (rtnObj.lendings.length) {
          rtnObj.lendings.forEach((lend: models.Lending) => {
            rtnObj.overDueDay += (+lend.overDueDay);
          });
        }
        return rtnObj;
      });
    }
    return items;
  }

  async userLendings(userId: number) {
    const lendingList = await this.usersRepository.getUserLendings(userId);
    return lendingList;
  }

  async userReservations(userId: number) {
    const reservationList = await this.usersRepository.getUserReservations(userId);
    return reservationList;
  }

  async searchUserBynicknameOrEmail(nicknameOrEmail: string, limit: number, page: number) {
    const [items, count] = await this.usersRepository.searchUserBy([
      { nickname: Like(`%${nicknameOrEmail}%`) },
      { email: Like(`%${nicknameOrEmail}`) },
    ], limit, page);
    const setItems = await this.setOverDueDay(items);
    const meta: types.Meta = {
      totalItems: count,
      itemCount: setItems.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(count / limit),
      currentPage: page + 1,
    };
    return { items: setItems, meta };
  }

  async searchUserById(id: number) {
    let items = (await this.usersRepository.searchUserBy({ id }, 0, 0))[0];
    items = await this.setOverDueDay(items);
    return { items };
  }

  async searchUserByEmail(email: string) {
    const items = (await this.usersRepository.searchUserBy({ email: Like(`%${email}%`) }, 0, 0))[0];
    return { items };
  }

  async searchUserByIntraId(intraId: number) {
    const items = (await this.usersRepository.searchUserBy({ intraId }, 0, 0))[0];
    return items;
  }

  async searchAllUsers(limit: number, page: number) {
    const [items, count] = await this.usersRepository.searchUserBy(1, limit, page);
    const setItems = await this.setOverDueDay(items);
    const meta: types.Meta = {
      totalItems: count,
      itemCount: setItems.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(count / limit),
      currentPage: page + 1,
    };
    return { items: setItems, meta };
  }

  async createUser(email: string, password: string) {
    const emailCount = (await this.usersRepository.searchUserBy({ email }, 0, 0))[1];
    if (emailCount > 0) {
      throw new Error(errorCode.EMAIL_OVERLAP);
    }
    await this.usersRepository.insertUser(email, password);
    return null;
  }

  async updateUserEmail(id: number, email:string) {
    const emailCount = (await this.usersRepository.searchUserBy({ email }, 0, 0))[1];
    if (emailCount > 0) {
      throw new Error(errorCode.EMAIL_OVERLAP);
    }
    await this.usersRepository.updateUser(id, { email });
  }

  async updateUserPassword(id: number, password: string) {
    await this.usersRepository.updateUser(id, { password });
  }

  async updateUserAuth(
    id: number,
    nickname: string,
    intraId: number,
    slack: string,
    role: number,
    penaltyEndDate: string,
  ) {
    const nicknameCount = (await this.usersRepository
      .searchUserBy({ nickname, id: Not(id) }, 0, 0))[1];
    if (nicknameCount > 0) {
      throw new Error(errorCode.NICKNAME_OVERLAP);
    }
    if (!(role >= 0 && role <= 3)) {
      throw new Error(errorCode.INVALID_ROLE);
    }
    const slackCount = (await this.usersRepository
      .searchUserBy({ nickname, slack: Not(slack) }, 0, 0))[1];
    if (slackCount > 0) {
      throw new Error(errorCode.SLACK_OVERLAP);
    }
    const updateParam = {
      nickname,
      intraId,
      slack,
      role,
      penaltyEndDate,
    };
    const updatedUser = this.usersRepository.updateUser(id, updateParam);
    return (updatedUser);
  }
}
