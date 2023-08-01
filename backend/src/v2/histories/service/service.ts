/* eslint-disable import/no-extraneous-dependencies */
import { match } from 'ts-pattern';

import { FindOperator, Like, type Repository } from 'typeorm';
import VHistories from '~/entity/entities/VHistories';

import { UnauthorizedError } from '~/v2/shared/errors';
import User from '~/entity/entities/User';
import { Meta } from '~/v2/shared';
import type { HistoriesService } from '.';

// HistoriesService

type Repos = { historiesRepo: Repository<VHistories> };

type MkSearchHistories = (
  repos: Repos
) => HistoriesService['searchAllHistories'];

type whereCondition = {
  login: FindOperator<string>,
  title: FindOperator<string>,
} | [{
  login: FindOperator<string>,
  title: FindOperator<string>,
}];

export const mkSearchHistories: MkSearchHistories = (histories) => async ({
  query, type, page, limit,
}) => {
  let filterQuery: whereCondition = {
    login: Like('%%'),
    title: Like('%%'),
  };
  if (type === 'user') {
    filterQuery.login = Like(`%${query}%`);
  } else if (type === 'title') {
    filterQuery.title = Like(`%${query}%`);
  } else {
    filterQuery = [{
      login: Like(`%${query}%`),
      title: Like(`%${query}%`),
    }];
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
  return [items, meta];
};
