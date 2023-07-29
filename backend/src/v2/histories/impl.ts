import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import jipDataSource from '~/app-data-source';
import BookInfo from '~/entity/entities/BookInfo';
// import Histories from '~/entity/entities/Histories';
import { roleSet } from '~/v1/auth/auth.type';
import authValidate from '~/v1/auth/auth.validate';

import { Repository } from 'typeorm';
import VHistories from '~/entity/entities/VHistories';

import { mkGetHistories } from './controller';
import {
  HistoriesService,
  MkSearchHistories,
} from './service';

const implHistoriesService = (repos: {
  histories: Repository<VHistories>;
}) => ({
  searchHistories: MkSearchHistories(repos),
});

const implHistoriesController = (service: HistoriesService) => ({
  get: mkGetHistories(service),
});

const service = implHistoriesService({
  histories: jipDataSource.getRepository(VHistories),
});

const handler = implHistoriesController(service);

const s = initServer();
export const histories = s.router(contract.histories, {
  get: {
    middleware: [authValidate(roleSet.all)],
    handler: handler.get,
  },
});
