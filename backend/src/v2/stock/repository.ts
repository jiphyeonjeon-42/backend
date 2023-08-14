import { LessThan } from 'typeorm';
import { startOfDay, addDays } from 'date-fns';
import { Book, VStock } from '~/entity/entities';
import jipDataSource from '~/app-data-source';

export const stockRepo = jipDataSource.getRepository(VStock);
export const bookRepo = jipDataSource.getRepository(Book);

type SearchStockArgs = { page: number; limit: number; days: number };

export const searchStockByUpdatedOlderThan = ({
  limit,
  page,
  days,
}: SearchStockArgs) => {
  const today = startOfDay(new Date());
  return stockRepo.findAndCount({
    where: { updatedAt: LessThan(addDays(today, days * -1)) },
    take: limit,
    skip: limit * page,
  });
};
