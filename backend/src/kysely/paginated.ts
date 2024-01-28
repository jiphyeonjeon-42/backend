import { SelectQueryBuilder } from 'kysely';

type Paginated<O> = {
  items: O[];
  meta: {
    totalItems: number;
    totalPages: number;
  };
};

export const metaPaginated = async <DB, TB extends keyof DB, O>(
  qb: SelectQueryBuilder<DB, TB, O>,
  { page, perPage }: { page: number; perPage: number },
): Promise<Paginated<O>> => {
  const { totalItems } = await qb
    .clearSelect()
    .select(({ fn }) => fn.countAll<number>().as('totalItems'))
    .executeTakeFirstOrThrow();

  const items = await qb
    .offset((page - 1) * perPage)
    .limit(perPage)
    .execute();

  const totalPages = Math.ceil(totalItems / perPage);

  return { items, meta: { totalItems, totalPages } };
};
