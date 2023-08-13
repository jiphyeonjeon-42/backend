/* eslint-disable import/no-extraneous-dependencies */
import { match } from 'ts-pattern';

import { FindOperator, Like, type Repository } from 'typeorm';
import { VHistories } from '~/entity/entities/VHistories';

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
  callSign: FindOperator<string>,
} | [
  { login: FindOperator<string> },
  { title: FindOperator<string> },
  { callSign: FindOperator<string> },
];

export const mkSearchHistories: MkSearchHistories = ({ historiesRepo }) => async ({
  query, type, page, limit,
}): Promise<{ items: VHistories[], meta: Meta }> => {
  let filterQuery: whereCondition = {
    login: Like('%%'),
    title: Like('%%'),
    callSign: Like('%%'),
  };
  if (query !== undefined) {
    if (type === 'user') {
      filterQuery.login = Like(`%${query}%`);
    } else if (type === 'title') {
      filterQuery.title = Like(`%${query}%`);
    } else if (type === 'callsign') {
      filterQuery.callSign = Like(`%${query}%`);
    } else {
      filterQuery = [
        { login: Like(`%${query}%`) },
        { title: Like(`%${query}%`) },
        { callSign: Like(`%${query}%`) },
      ];
    }
  }
  const [items, count] = await historiesRepo.findAndCount({
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
  const returnObject = {
    items,
    meta,
  };
  return returnObject;
};
