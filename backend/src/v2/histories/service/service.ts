/* eslint-disable import/no-extraneous-dependencies */
import { match } from 'ts-pattern';

import { Like, type Repository } from 'typeorm';
import VHistories from '~/entity/entities/VHistories';

import { UnauthorizedError } from '~/v2/shared/errors';
import User from '~/entity/entities/User';
import type { HistoriesService } from '.';
import { Meta } from '~/v2/shared';

// HistoriesService

type Repos = { historiesRepo: Repository<VHistories>, userRepo: Repository<User> };

type MkSearchHistories = (
  repos: Repos
) => HistoriesService['search'];

export const mkSearchHistories: MkSearchHistories = (histories) => async ({
  query, who, page, limit, type,
}, { userId, userRole }) => {
  if (who === 'all' && userRole !== 2) {
    return (new UnauthorizedError());
  }
  let filterQuery: any = {};
  if (who === 'my') {
    const user = await histories.userRepo.find({ where: { id: userId } });
    filterQuery.login = user[0].nickname;
  } else if (type === 'user') {
    filterQuery.login = Like(`%${query}%`);
  } else if (type === 'title') {
    filterQuery.title = Like(`%${query}%`);
  } else {
    filterQuery = [
      { login: Like(`%${query}%`) },
      { title: Like(`%${query}%`) },
    ];
  }
  const [items, count] = await histories.historiesRepo.findAndCount({
    where: filterQuery,
    take: limit,
    skip: limit * page,
  });
  const meta: Meta = {
    totalItems: count,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(count / limit),
    currentPage: page + 1,
  };
  return { items, meta };
};
