/* eslint-disable import/no-extraneous-dependencies */
import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import { reviewsControllerV2 } from '../reviews/controller/reviews.controller.v2';

const s = initServer();
export default s.router(contract, {
  reviews: reviewsControllerV2,
});
