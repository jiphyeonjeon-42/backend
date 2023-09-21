import { Like, Not } from 'typeorm';
import * as errorCode from '~/v1/utils/error/errorCode';
import * as models from '../DTO/users.model';
import * as types from '../DTO/common.interface';
import UsersRepository from './users.repository';

export default class UsersService {
  private readonly usersRepository: UsersRepository;

  constructor() {
    this.usersRepository = new UsersRepository();
  }

  /**
   * 기존 사용자 배열에 대출과 연체 정보를 추가하여 반환합니다.
   *
   * @returns 사용자의 대출 정보를 포함한 사용자 정보 배열
   * @todo 대출 정보까지 함께 쿼리하는 searchUsersBy 메서드를 만들고 searchUserBy* 에서 사용하도록 수정
   */
  async withLendingInfo(users: models.User[]): Promise<models.User[]> {
    const usersIdList = users.map((user) => ({ userId: user.id }));
    const lending = (await this.usersRepository.getLending(
      usersIdList,
    )) as unknown as models.Lending[];

    return users.map((user) => {
      const lendings = lending.filter((lend) => lend.userId === user.id);
      const overDueDay = lendings.reduce((acc, cur) => acc + cur.overDueDay, 0);
      return { ...user, lendings, overDueDay };
    });
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
    const [items, count] = await this.usersRepository.searchUserBy(
      [{ nickname: Like(`%${nicknameOrEmail}%`) }, { email: Like(`%${nicknameOrEmail}`) }],
      limit,
      page,
    );
    const setItems = await this.withLendingInfo(items);
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
    if (!id) return null;
    let items = (await this.usersRepository.searchUserBy({ id }, 0, 0))[0];
    items = await this.withLendingInfo(items);
    return { items };
  }

  async searchUserByEmail(email: string) {
    const items = (await this.usersRepository.searchUserBy({ email: Like(`%${email}%`) }, 0, 0))[0];
    return { items };
  }

  async searchUserWithPasswordByEmail(email: string) {
    const items = (
      await this.usersRepository.searchUserWithPasswordBy({ email: Like(`%${email}%`) }, 0, 0)
    )[0];
    return { items };
  }

  async searchUserByIntraId(intraId: number) {
    const items = (await this.usersRepository.searchUserBy({ intraId }, 0, 0))[0];
    return items;
  }

  async searchAllUsers(limit: number, page: number) {
    const [items, count] = await this.usersRepository.searchUserBy(1, limit, page);
    const setItems = await this.withLendingInfo(items);
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
    const result = await this.usersRepository.insertUser(email, password);
    return result;
  }

  async updateUserEmail(id: number, email: string) {
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
    const nicknameCount = (
      await this.usersRepository.searchUserBy({ nickname, id: Not(id) }, 0, 0)
    )[1];
    if (nicknameCount > 0) {
      throw new Error(errorCode.NICKNAME_OVERLAP);
    }
    if (!(role >= 0 && role <= 3)) {
      throw new Error(errorCode.INVALID_ROLE);
    }
    const slackCount = (
      await this.usersRepository.searchUserBy({ nickname, slack: Not(slack) }, 0, 0)
    )[1];
    if (slackCount > 0) {
      throw new Error(errorCode.SLACK_OVERLAP);
    }
    const updateParam: any = {
      nickname,
      intraId,
      slack,
      role,
    };
    if (penaltyEndDate) {
      updateParam.penaltyEndDate = penaltyEndDate;
    }
    const updatedUser = this.usersRepository.updateUser(id, updateParam);
    return updatedUser;
  }
}
