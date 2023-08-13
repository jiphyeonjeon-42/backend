import { VHistories } from '~/entity/entities/VHistories';
import { Meta, UnauthorizedError } from '~/v2/shared';

type Args = {
  query?: string | undefined;
  page: number;
  limit: number;
  type?: 'title' | 'user' | 'callsign' | undefined;
};

export type HistoriesService = {
  searchMyHistories: (
    args: Args,
    ) => Promise<UnauthorizedError | { items: VHistories[], meta: Meta }>;
  searchAllHistories: (
    args: Args,
    ) => Promise<UnauthorizedError | { items: VHistories[], meta: Meta }>;
  }

export * from './service';
