import { Repository } from 'typeorm';
import { VHistories } from '~/entity/entities/VHistories';

import {
  mkSearchHistories,
} from './service';

export const implHistoriesService = (repos: {
  historiesRepo: Repository<VHistories>;
}) => ({
  searchMyHistories: mkSearchHistories(repos),
  searchAllHistories: mkSearchHistories(repos),
});
