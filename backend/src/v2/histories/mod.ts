import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import jipDataSource from '~/app-data-source';
import { roleSet } from '~/v1/auth/auth.type';
import authValidate from '~/v1/auth/auth.validate';
import { VHistories } from '~/entity/entities/VHistories';
import { getHistoriesByQuery, getHistoriesByUser } from './repository';
import { getUser } from '../shared';

const s = initServer();
export const histories = s.router(contract.histories, {
  getMyHistories: {
    middleware: [authValidate(roleSet.all)],
    handler: async ({ query, req: { user } }) => {
      const { nickname: login } = getUser.parse(user);
      const [items, count] = await getHistoriesByUser({ ...query, login });

      const meta = {
        totalItems: count,
        itemCount: items.length,
        itemsPerPage: query.limit,
        totalPages: Math.ceil(count / query.limit),
        currentPage: query.page + 1,
      };

      return { status: 200, body: { items, meta } };
    },
  },

  getAllHistories: {
    middleware: [authValidate(roleSet.librarian)],
    handler: async ({ query }) => {
      const [items, count] = await getHistoriesByQuery(query);

      const meta = {
        totalItems: count,
        itemCount: items.length,
        itemsPerPage: query.limit,
        totalPages: Math.ceil(count / query.limit),
        currentPage: query.page + 1,
      };

      return { status: 200, body: { items, meta } };
    },
  },
});
