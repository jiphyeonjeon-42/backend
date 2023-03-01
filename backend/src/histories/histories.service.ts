import { Like } from 'typeorm';
import { Meta } from '../users/users.type';
import HistoriesRepository from './histories.repository';
import UsersRepository from '../users/users.repository';

// eslint-disable-next-line import/prefer-default-export
export const getHistories = async (
  query: string,
  who: string,
  userId: number,
  type: string,
  page: number,
  limit: number,
) => {
  const filterQuery: any = {};
  if (who === 'my') {
    const usersRepo = new UsersRepository();
    const user = (await usersRepo.searchUserBy({ id: userId }, 0, 0))[0];
    filterQuery.login = user[0].nickname;
  }
  if (type === 'user') {
    filterQuery.login = Like(`%${query}%`);
  } else if (type === 'title') {
    filterQuery.title = Like(`%${query}%`);
  } else {
    filterQuery.login = Like(`%${query}%`);
    filterQuery.title = Like(`%${query}%`);
  }
  const historiesRepo = new HistoriesRepository();
  const [items, count] = await historiesRepo.getHistoriesItems(filterQuery, limit, page);
  const meta: Meta = {
    totalItems: count,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(count / limit),
    currentPage: page + 1,
  };
  return { items, meta };
};
