import { match } from 'ts-pattern';

import { VStock } from '~/entity/entities';
import { type Repository } from 'typeorm';

import { Meta } from '~/v2/shared';
import { BookNotFoundError } from '~/v2/shared/errors';
import { searchStockByUpdatedOlderThan } from './repository';
import { stockRepo } from './repository';
import { bookRepo } from './repository';

type SearchArgs = { page: number; limit: number };
export const searchStock = async ({
  limit,
  page,
}: SearchArgs): Promise<{ items: VStock[]; meta: Meta }> => {
  const [items, totalItems] = await searchStockByUpdatedOlderThan({
    limit,
    page,
    days: 15,
  });

  const meta: Meta = {
    totalItems,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page + 1,
  };

  return { items, meta };
};

type UpdateArgs = { id: number };
export const updateStock = async ({ id }: UpdateArgs) => {
  const stock = await stockRepo.findOneBy({ bookId: id });

  return match(stock)
    .with(null, () => new BookNotFoundError(id))
    .otherwise(() => bookRepo.update({ id }, { updatedAt: new Date() }));
};
