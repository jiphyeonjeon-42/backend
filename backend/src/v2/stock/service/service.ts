import { match } from 'ts-pattern';

import { VStock } from '~/entity/entities';
import { type Repository, LessThan } from 'typeorm';

import { startOfDay, addDays } from 'date-fns';
import { Meta } from '~/v2/shared';
import { BookNotFoundError } from '~/v2/shared/errors';
import type { StockService } from '.';

type Repos = { stockRepo: Repository<VStock> };

type MkSearchStock = (
	repos: Repos
 ) => StockService['searchStock'];

export const mkSearchStock: MkSearchStock = ({ stockRepo }) =>
  async ({ page, limit }) => {
    const today = startOfDay(new Date());
    const [items, totalItems] = await stockRepo.findAndCount({
      where: {
        updatedAt: LessThan(addDays(today, -15)),
      },
      take: limit,
      skip: limit * page,
    });

    const meta: Meta = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page + 1,
    };

    const returnObject = {
      items,
      meta,
    };
    console.log(returnObject);
    return returnObject;
  };

type MkUpdateStock = (repos: Repos) => StockService['updateStock'];
export const mkUpdateStock: MkUpdateStock = ({ stockRepo }) =>
  async ({ id }) => {
    const stock = await stockRepo.findOneBy({ bookId: id });

    return match(stock)
      .with(null, () => new BookNotFoundError(id))
      .otherwise(() => stockRepo.update({ bookId: id }, { updatedAt: new Date() }));
  };
