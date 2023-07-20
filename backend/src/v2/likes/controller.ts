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

import { mkCreateLike, ILikesService } from './service';



export const mkPostLikes = ({ createLike } : Pick<ILikesService, 'createLike'>) =>
  async () => {
    await createLike({ bookInfoId: 4, userId: 1325 });

    return { status: 201, body: '좋아요가 생성되었습니다' } as const;
  };
