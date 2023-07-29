import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import { roleSet } from '~/v1/auth/auth.type';
import authValidate from '~/v1/auth/auth.validate';

import jipDataSource from '~/app-data-source';
import BookInfo from '~/entity/entities/BookInfo';
import Reviews from '~/entity/entities/Reviews';
import { implReviewController } from './controller/impl';
import { implReviewService } from './service/impl';

const service = implReviewService({
  reviews: jipDataSource.getRepository(Reviews),
  bookInfo: jipDataSource.getRepository(BookInfo),
});
const handler = implReviewController(service);

const s = initServer();
export const reviews = s.router(contract.reviews, {
  post: {
    middleware: [authValidate(roleSet.all)],
    handler: handler.post,
  },
  put: {
    middleware: [authValidate(roleSet.all)],
    handler: handler.put,
  },
  patch: {
    middleware: [authValidate(roleSet.librarian)],
    handler: handler.patch,
  },
  delete: {
    middleware: [authValidate(roleSet.all)],
    handler: handler.delete,
  },
});
