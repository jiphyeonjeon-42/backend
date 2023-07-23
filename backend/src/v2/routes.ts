/* eslint-disable import/no-extraneous-dependencies */
import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';

import { reviews } from './reviews/implementation';
import { likes } from './likes/implementation';

const s = initServer();
export default s.router(contract, {
  likes,
  reviews,
});
