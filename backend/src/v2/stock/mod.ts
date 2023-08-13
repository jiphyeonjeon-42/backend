import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import { searchStock, updateStock } from './service';
import { BookNotFoundError, bookNotFound } from '../shared';

const s = initServer();
export const stock = s.router(contract.stock, {
  get: async ({ query }) => {
    const result = await searchStock(query);

    return { status: 200, body: result } as const;
  },

  patch: async ({ body }) => {
    const result = await updateStock(body);

    if (result instanceof BookNotFoundError) {
      return bookNotFound;
    }
    return { status: 200, body: '재고 상태가 업데이트되었습니다.' } as const;
  }
});
