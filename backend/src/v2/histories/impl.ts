import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import jipDataSource from '~/app-data-source';
import BookInfo from '~/entity/entities/BookInfo';
// import Histories from '~/entity/entities/Histories';
import { roleSet } from '~/v1/auth/auth.type';
import authValidate from '~/v1/auth/auth.validate';

import { Repository } from 'typeorm';
import VHistories from '~/entity/entities/VHistories';

import { mkGetMyHistories, mkGetAllHistories } from './controller';
import {
  HistoriesService,
  mkSearchHistories,
} from './service';

const implHistoriesService = (repos: {
  historiesRepo: Repository<VHistories>;
}) => ({
  searchMyHistories: mkSearchHistories(repos),
  searchAllHistories: mkSearchHistories(repos),
});

const implHistoriesController = (service: HistoriesService) => ({
  getMyHistories: mkGetMyHistories(service),
  getAllHistories: mkGetAllHistories(service),
});

const service = implHistoriesService({
  historiesRepo: jipDataSource.getRepository(VHistories),
});

const handler = implHistoriesController(service);

const s = initServer();
export const histories = s.router(contract.histories, {
  getMyHistories: {
    middleware: [authValidate(roleSet.all)],
    handler: handler.getMyHistories,
  },
  getAllHistories: {
    middleware: [authValidate(roleSet.librarian)],
    handler: handler.getAllHistories,
  },
});
