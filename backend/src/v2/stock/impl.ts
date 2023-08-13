import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import jipDataSource from '~/app-data-source';
import { VStock, Book } from '~/entity/entities';
import { implStockService } from '~/v2/stock/service/impl';
import { implStockController } from '~/v2/stock/controller/impl';

const service = implStockService({
  stockRepo: jipDataSource.getRepository(VStock),
  bookRepo: jipDataSource.getRepository(Book),
});

const handler = implStockController(service);

const s = initServer();
export const stock = s.router(contract.stock, {
  get: {
    handler: handler.getStock,
  },
  patch: {
    handler: handler.patchStock,
  },
});
