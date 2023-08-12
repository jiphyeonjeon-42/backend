import { Repository } from 'typeorm';
import { VStock } from '~/entity/entities';

import { mkSearchStock, mkUpdateStock } from './service';

export const implStockService = (repos: {
	stockRepo: Repository<VStock>;
}) => ({
  searchStock: mkSearchStock(repos),
  updateStock: mkUpdateStock(repos),
});
