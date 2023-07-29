/* eslint-disable import/no-extraneous-dependencies */
import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';

import { reviews } from './reviews/impl';
import { histories } from './histories/impl';

const s = initServer();
export default s.router(contract, {
  reviews,
  histories
});
