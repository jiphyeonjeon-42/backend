import { match } from 'ts-pattern';
import { DB } from '~/kysely/generated.ts';
import { db } from '~/kysely/mod.ts';
import { ExpressionBuilder, SelectQueryBuilder } from "kysely";
import { AllSelection } from "kysely/dist/esm/parser/select-parser";

const queriesLike = (sql: SelectQueryBuilder<DB, 'v_histories', AllSelection<DB, 'v_histories'>>, query: string) => {
  const all = sql.where((eb: ExpressionBuilder<DB, 'v_histories'>) =>
    eb('login', 'like', `%${query}%`)
      .or('title', 'like', `%${query}%`)
      .or('callSign', 'like', `%${query}%`));
  const login = sql.where((eb: ExpressionBuilder<DB, 'v_histories'>) =>
    eb('login', 'like', `%${query}%`));
  const title = sql.where((eb: ExpressionBuilder<DB, 'v_histories'>) =>
    eb('title', 'like', `%${query}%`));
  const callSign = sql.where((eb: ExpressionBuilder<DB, 'v_histories'>) =>
    eb('callSign', 'like', `%${query}%`));

  return { all, login, title, callSign };
};

const getSearchCondition = (sql: SelectQueryBuilder<DB, 'v_histories', AllSelection<DB, 'v_histories'>>, { query, type }: Args) => {
  if (!query) {
    return sql;
  }
  const { all, login, title, callSign } = queriesLike(sql, query);
  return match(type)
    .with(undefined, () => all)
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

export const getHistoriesByQuery = async ({ query, type, page, limit }: Args & Offset) => {
  let sql = db.selectFrom('v_histories')
    .selectAll();
  sql = getSearchCondition(sql, {query, type});
  const items = await sql.limit(limit)
    .offset(limit * page)
    .execute();
  let countSql = db.selectFrom('v_histories')
    .select(({fn}) => [ fn.count<number>('id').as('count') ]);
  countSql = getSearchCondition(countSql, {query, type});
  const [{count}] = await countSql.execute();
  return { items, count };
}

type MyPageArgs = {
  login: string;
  query?: string | undefined;
  type?: 'title' | 'callsign' | undefined;
};

export const getHistoriesByUser = async ({login, page, limit}: MyPageArgs & Offset) => {
  const items = await db.selectFrom('v_histories')
    .where('login', '=', login)
    .selectAll()
    .limit(limit)
    .offset(limit * page)
    .execute();
  const [{count}] = await db.selectFrom('v_histories')
    .where('login', '=', login)
    .select(({fn}) => [ fn.count<number>('id').as('count') ])
    .execute();
  return { items, count };
}
