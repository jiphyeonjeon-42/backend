import { contract } from '@jiphyeonjeon-42/contracts';
import { P, match } from 'ts-pattern';
import {
  UnauthorizedError,
  HandlerFor,
  unauthorized,
} from '../shared';
import { HistoriesService } from './service';
import { getHistoriesSearchCondition, getHistoriesUserInfo } from './type';

// mkGetHistories
type GetDeps = Pick<HistoriesService, 'searchHistories'>;
type MkGet = (services: GetDeps) => HandlerFor<typeof contract.histories.get>;
export const mkGetHistories: MkGet = ({ searchHistories }) =>
  async ({
    query: {
      query, who, page, limit, type,
    }, req: user,
  }) => {
    const userInfo = getHistoriesUserInfo.safeParse(user);
    const parsedQuery = getHistoriesSearchCondition.safeParse(query);
    const result = await searchHistories(parsedQuery, userInfo);

    return match(result)
      .with(P.instanceOf(UnauthorizedError), () => unauthorized)
      .otherwise(() => ({ status: 200, body: '대출 기록이 성공적으로 조회되었습니다.' } as const));
  };
