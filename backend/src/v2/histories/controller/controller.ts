import { contract } from '@jiphyeonjeon-42/contracts';
import { P, match } from 'ts-pattern';
import {
  UnauthorizedError,
  HandlerFor,
  unauthorized,
} from '../../shared';
import { HistoriesService } from '../service';

// mkGetMyHistories
type GetMyDeps = Pick<HistoriesService, 'searchMyHistories'>;
type MkGetMy = (services: GetMyDeps) => HandlerFor<typeof contract.histories.getMyHistories>;
export const mkGetMyHistories: MkGetMy = ({ searchMyHistories }) =>
  async ({ query }) => {
    const result = await searchMyHistories(query);

    return match(result)
      .with(P.instanceOf(UnauthorizedError), () => unauthorized)
      .otherwise((body) => ({ status: 200, body } as const));
  };

// mkGetAllHistories
type GetAllDeps = Pick<HistoriesService, 'searchAllHistories'>;
type MkGetAll = (services: GetAllDeps) => HandlerFor<typeof contract.histories.getAllHistories>;
export const mkGetAllHistories: MkGetAll = ({ searchAllHistories }) => async ({ query }) => {
  const result = await searchAllHistories(query);
  return match(result)
    .with(P.instanceOf(UnauthorizedError), () => unauthorized)
    .otherwise((body) => ({ status: 200, body } as const));
};
