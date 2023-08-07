import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import jipDataSource from '~/app-data-source';
import { roleSet } from '~/v1/auth/auth.type';
import authValidate from '~/v1/auth/auth.validate';
import { VHistories } from '~/entity/entities/VHistories';
import { implHistoriesService } from '~/v2/histories/service/impl';
import { implHistoriesController } from '~/v2/histories/controller/impl';

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
