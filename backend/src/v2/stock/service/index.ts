import { UpdateResult } from 'typeorm';
import { VStock } from '~/entity/entities';
import { Meta, BookNotFoundError } from '~/v2/shared';

type SearchArgs = {
	page: number,
	limit: number,
};

type UpdateArgs = {
	id: number,
};

export type StockService = {
	searchStock: (
		args: SearchArgs,
		) => Promise<{ items: VStock[], meta: Meta }>;
	updateStock: (
		args: UpdateArgs,
		) => Promise<BookNotFoundError | UpdateResult>;
};

export * from './service';
