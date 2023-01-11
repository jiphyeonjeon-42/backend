import { Like, Not } from 'typeorm';
import * as errorCode from '../utils/error/errorCode';
import * as models from './users.model';
import * as types from './users.type';
import usersRepository from './users.repository';

export const setOverDueDay = async (items: models.User[]) => {
  const lending = (await usersRepository.getLending()) as unknown as models.Lending[];
  if (items) {
    return items.map((item: models.User) => {
      const rtnObj: models.User = Object.assign(item);
      rtnObj.lendings = lending.filter((lend) => lend.userId === item.id);
      rtnObj.overDueDay = 0;
      if (rtnObj.lendings.length) {
        rtnObj.lendings.forEach((lend: models.Lending) => {
          rtnObj.overDueDay += lend.overDueDay;
        });
      }
      return rtnObj;
    });
  }
  return items;
};

export const userReservations = async (userId: number) => {
  const reservationList = await usersRepository.getUserReservations(userId);
  return reservationList;
};

// eslint-disable-next-line max-len
export const searchUserBynicknameOrEmail = async (nicknameOrEmail: string, limit: number, page: number) => {
  const [items, count] = await usersRepository.searchUserBy([
    { nickname: Like(`%${nicknameOrEmail}%`) },
    { email: Like(`%${nicknameOrEmail}`) },
  ], limit, page);
  const setItems = await setOverDueDay(items);
  const meta: types.Meta = {
    totalItems: count,
    itemCount: setItems.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(count / limit),
    currentPage: page + 1,
  };
  return { items, meta };
};

export const searchUserById = async (id: number) => {
  let items = (await usersRepository.searchUserBy({ id }, 0, 0))[0];
  items = await setOverDueDay(items);
  return { items };
};

export const searchUserByEmail = async (email: string) => {
  const items = (await usersRepository.searchUserBy({ email: Like(`%${email}%`) }, 0, 0))[0];
  return { items };
};

export const searchUserByIntraId = async (intraId: number) => {
  const items = (await usersRepository.searchUserBy({ intraId }, 0, 0))[0];
  return items;
};

export const searchAllUsers = async (limit: number, page: number) => {
  const [items, count] = await usersRepository.searchUserBy(1, limit, page);
  const setItems = await setOverDueDay(items);
  const meta: types.Meta = {
    totalItems: count,
    itemCount: setItems.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(count / limit),
    currentPage: page + 1,
  };
  return { setItems, meta };
};

export const createUser = async (email: string, password: string) => {
  const emailCount = (await usersRepository.searchUserBy({ email }, 0, 0))[1];
  if (emailCount > 0) {
    throw new Error(errorCode.EMAIL_OVERLAP);
  }
  await usersRepository.insertUser(email, password);
  return null;
};

export const updateUserEmail = async (id: number, email:string) => {
  const emailCount = (await usersRepository.searchUserBy({ email }, 0, 0))[1];
  if (emailCount > 0) {
    throw new Error(errorCode.EMAIL_OVERLAP);
  }
  await usersRepository.updateUser(id, { email });
};

export const updateUserPassword = async (id: number, password: string) => {
  await usersRepository.updateUser(id, { password });
};

export const updateUserAuth = async (
  id: number,
  nickname: string,
  intraId: number,
  slack: string,
  role: number,
  penaltyEndDate: string,
) => {
  const nicknameCount = (await usersRepository.searchUserBy({ nickname, id: Not(id) }, 0, 0))[1];
  if (nicknameCount > 0) {
    throw new Error(errorCode.NICKNAME_OVERLAP);
  }
  if (!(role >= 0 && role <= 3)) {
    throw new Error(errorCode.INVALID_ROLE);
  }
  const slackCount = (await usersRepository.searchUserBy({ nickname, slack: Not(slack) }, 0, 0))[1];
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
  const updatedUser = usersRepository.updateUser(id, updateParam);
  return (updatedUser);
};
