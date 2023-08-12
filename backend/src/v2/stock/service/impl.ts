import { Repository } from 'typeorm';
import { VStock, Book } from '~/entity/entities';

import { mkSearchStock, mkUpdateStock } from './service';

export const implStockService = (repos: {
	stockRepo: Repository<VStock>;
  bookRepo: Repository<Book>;
}) => ({
  searchStock: mkSearchStock(repos),
  updateStock: mkUpdateStock(repos),
});
