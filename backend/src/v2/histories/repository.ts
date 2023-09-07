import { Like } from 'typeorm';
import { match } from 'ts-pattern';
import jipDataSource from '~/app-data-source';
import { VHistories } from '~/entity/entities';

const historiesRepo = jipDataSource.getRepository(VHistories);

const queriesLike = (query: string) => {
  const like = Like(`%${query}%`);
  const login = { login: like };
  const title = { title: like };
  const callSign = { callSign: like };

  return { login, title, callSign };
};

const getSearchCondition = ({ query, type }: Args) => {
  if (!query) {
    return undefined;
  }

  const { login, title, callSign } = queriesLike(query);
  return match(type)
    .with(undefined, () => [login, title, callSign])
    .with('user', () => login)
    .with('title', () => title)
    .with('callsign', () => callSign)
    .exhaustive();
};

type Offset = {
  page: number;
  limit: number;
};

type Args = {
  query?: string | undefined;
  type?: 'title' | 'user' | 'callsign' | undefined;
};

export const getHistoriesByQuery = ({ query, type, page, limit }: Args & Offset) =>
  historiesRepo.findAndCount({
    where: getSearchCondition({ query, type }),
    take: limit,
    skip: limit * page,
  });

type MyPageArgs = {
  login: string;
  query?: string | undefined;
  type?: 'title' | 'callsign' | undefined;
};

export const getHistoriesByUser = ({ login, page, limit }: MyPageArgs & Offset) =>
  historiesRepo.findAndCount({
    where: { login },
    take: limit,
    skip: limit * page,
  });
