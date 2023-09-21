import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';
import { roleSet } from '~/v1/auth/auth.type';
import authValidate from '~/v1/auth/auth.validate';

import {
  BookInfoNotFoundError,
  bookInfoNotFound,
  getUser,
  reviewNotFound,
} from '../shared/index.ts';
import { createReview, removeReview, toggleReviewVisibility, updateReview } from './service.ts';
import { ReviewNotFoundError } from './errors.js';
import { searchReviews } from './repository.ts';

const s = initServer();
export const reviews = s.router(contract.reviews, {
  get: {
    middleware: [authValidate(roleSet.librarian)],
    handler: async ({ query }) => {
      const body = await searchReviews(query);

      return { status: 200, body };
    },
  },
  post: {
    middleware: [authValidate(roleSet.all)],
    // prettier-ignore
    handler: async ({ query: { bookInfoId }, body: { content }, req: { user } }) => {
      const { id: userId } = getUser.parse(user);
      const result = await createReview({ bookInfoId, userId, content });

      if (result instanceof BookInfoNotFoundError) {
        return bookInfoNotFound;
      }
      return { status: 201, body: '리뷰가 작성되었습니다.' } as const;
    },
  },
  put: {
    middleware: [authValidate(roleSet.all)],
    // prettier-ignore
    handler: async ({ params: { reviewsId }, body: { content }, req: { user } }) => {
      const { id: userId } = getUser.parse(user);
      const result = await updateReview({ reviewsId, userId, content });

      if (result instanceof ReviewNotFoundError) {
        return reviewNotFound;
      }
      return { status: 200, body: '리뷰가 수정되었습니다.' } as const;
    },
  },
  patch: {
    middleware: [authValidate(roleSet.librarian)],
    handler: async ({ params: { reviewsId }, req: { user } }) => {
      const { id: userId } = getUser.parse(user);
      const result = await toggleReviewVisibility({ reviewsId, userId });

      if (result instanceof ReviewNotFoundError) {
        return reviewNotFound;
      }
      return {
        status: 200,
        body: '리뷰 공개 여부가 업데이트되었습니다.',
      } as const;
    },
  },
  delete: {
    middleware: [authValidate(roleSet.all)],
    handler: async ({ params: { reviewsId }, req: { user } }) => {
      const deleter = getUser.parse(user);
      const result = await removeReview({ reviewsId, deleter });

      if (result instanceof ReviewNotFoundError) {
        return reviewNotFound;
      }
      return { status: 200, body: '리뷰가 삭제되었습니다.' } as const;
    },
  },
});
