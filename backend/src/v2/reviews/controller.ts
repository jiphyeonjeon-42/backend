/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { initServer } from '@ts-rest/express';
import { contract } from '@jiphyeonjeon-42/contracts';
import { z } from 'zod';

import authValidate from '~/v1/auth/auth.validate';
import { roleSet } from '~/v1/auth/auth.type';
import { positiveInt } from '~/v1/reviews/controller/reviews.type';

import jipDataSource from '~/app-data-source';
import Reviews from '~/entity/entities/Reviews';

import { P, match } from 'ts-pattern';

import ReviewsService, { ReviewNotFoundError, IReviewsService, mkCreateReviews, BookInfoNotFoundError } from './service';
import { ServerInferRoute } from '../inferRoute';
import { getUser } from './implementation';

type MkPostReviews = (args: { req: { body: string; user: Express.User; query: number } }) => Promise<{
    status: 201;
    body: "리뷰가 작성되었습니다.";
} | {
    status: 404;
    body: {
        code: "BOOK_INFO_NOT_FOUND";
        message: "검색한 책이 존재하지 않습니다.";
    };
}>

export const mkPostReviews = ({ createReviews } : Pick<IReviewsService, 'createReviews'>): MkPostReviews =>
  async ({ req: { user, body, query }}) => {
    const { id: userId } = getUser.parse(user);
    const result = await createReviews({ bookInfoId: query, userId, content: body });

    return match(result)
      .with(P.instanceOf(BookInfoNotFoundError), () => ({ status: 404, body: { code: 'BOOK_INFO_NOT_FOUND', message: '검색한 책이 존재하지 않습니다.' } }) as const)
      .otherwise(() => ({ status: 201, body: '리뷰가 작성되었습니다.' }) as const);
  };

