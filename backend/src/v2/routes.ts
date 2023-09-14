/* eslint-disable import/no-extraneous-dependencies */
import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';

import { reviews } from './reviews/mod.ts';
import { lendings } from './lendings/mod.ts';
import { books } from './books/mod.ts';

const s = initServer();
export default s.router(contract, {
  reviews,
  lendings,
  books,
});
