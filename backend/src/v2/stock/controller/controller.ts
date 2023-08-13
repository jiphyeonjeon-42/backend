import { contract } from '@jiphyeonjeon-42/contracts';
import { P, match } from 'ts-pattern';
import { UpdateResult } from 'typeorm';
import {
  bookNotFound,
  HandlerFor,
} from '../../shared';
import { StockService } from '../service';

type GetDeps = Pick<StockService, 'searchStock'>;
type MkGet = (services: GetDeps) => HandlerFor<typeof contract.stock.get>;
export const mkGetStock: MkGet = ({ searchStock }) =>
  async ({ query: { page, limit } }) => {
    contract.stock.get.query.safeParse({ page, limit });
    const result = await searchStock({ page, limit });

    return match(result)
      .otherwise(() => ({
        status: 200,
        body: result,
      } as const));
  };

type PatchDeps = Pick<StockService, 'updateStock'>;
type MkPatch = (services: PatchDeps) => HandlerFor<typeof contract.stock.patch>;
export const mkPatchStock: MkPatch = ({ updateStock }) =>
  async ({ body: { id } }) => {
    contract.stock.patch.body.safeParse({ id });
    const result = await updateStock({ id });

    return match(result)
      .with(
        P.instanceOf(UpdateResult),
        () => ({ status: 200, body: '재고 상태가 업데이트되었습니다.' } as const),
      )
      .otherwise(() => bookNotFound);
  };
