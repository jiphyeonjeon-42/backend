import { contract } from '@jiphyeonjeon-42/contracts';
import { P, match } from 'ts-pattern';
import {
  UnauthorizedError,
  HandlerFor,
  unauthorized, Meta,
} from '../shared';
import { HistoriesService } from './service';
import { VHistories } from "~/entity/entities";

// mkGetMyHistories
type GetMyDeps = Pick<HistoriesService, 'searchMyHistories'>;
type MkGetMy = (services: GetMyDeps) => HandlerFor<typeof contract.histories.getMyHistories>;
export const mkGetMyHistories: MkGetMy = ({ searchMyHistories }) =>
  async ({
    query: {
      query, page, limit, type,
    },
  }) => {
    contract.histories.getMyHistories.query.safeParse({
      query, page, limit, type,
    });
    const result = await searchMyHistories({
      query, page, limit, type,
    });

    return match(result)
      .with(P.instanceOf(UnauthorizedError), () => unauthorized)
      .otherwise(() => ({
        status: 200,


        body: result,
      } as const));
  };

// mkGetAllHistories
type GetAllDeps = Pick<HistoriesService, 'searchAllHistories'>;
type MkGetAll = (services: GetAllDeps) => HandlerFor<typeof contract.histories.getAllHistories>;
export const mkGetAllHistories: MkGetAll = ({ searchAllHistories }) => async ({
  query: { query, page, limit, type },
}) => {
  const parsedQuery = contract.histories.getMyHistories.query.parse({
    query, page, limit, type,
  });
  const result = await searchAllHistories(parsedQuery);
  return match(result)
    .with(P.instanceOf(UnauthorizedError), () => unauthorized)
    .otherwise(() => ({
      status: 200,
      body: result,
    } as const));
};
