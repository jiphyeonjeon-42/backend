/* eslint-disable import/no-extraneous-dependencies */
import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';

import { reviews } from './reviews/mod.ts';
import { histories } from './histories/mod.ts';
import { stock } from './stock/mod.ts';
import { books } from './books/mod.ts';

const s = initServer();
export default s.router(contract, {
  reviews,
  histories,
  stock,
  books
});
