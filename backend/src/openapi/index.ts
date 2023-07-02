/* eslint-disable @typescript-eslint/no-unused-vars */
import swaggerJsdoc from 'swagger-jsdoc';

import { openApiBuilder } from '@zodios/openapi';
import {
  AuthApi,
  // eslint-disable-next-line camelcase
  BookInfo_reviewsApi,
  BooksApi,
  LikeApi,
  HistoriesApi,
  LendingsApi,
  ReservationsApi,
  ReviewsApi,
  StockApi,
  TagsApi,
  UsersApi,
} from '@jiphyeonjeon/api';
import { swaggerOptions, zodiosSwaggerOptions } from './options';

/**
 * 기존 Swagger 문서
 *
 * router경로에 주석 형식으로 작성된 openapi 문서를 읽어
 * swagger 문서를 생성합니다.
 */
export const document = swaggerJsdoc(swaggerOptions);

/**
 * 신규 Swagger 문서
 *
 * zodios api 선언을 통해 swagger 문서를 생성합니다.
 * TODO: 동작하는 api만 추가
 */
export const newDocument = openApiBuilder(zodiosSwaggerOptions)
  .addServer({ url: 'http://localhost:3000/' })
  .addPublicApi(AuthApi)
  .addPublicApi(BooksApi)
  .addPublicApi(LendingsApi)
  .addPublicApi(ReservationsApi)
  .addPublicApi(UsersApi)
  .addPublicApi(HistoriesApi)
  .addPublicApi(BookInfo_reviewsApi)
  .addPublicApi(ReviewsApi)
  .addPublicApi(LikeApi)
  .addPublicApi(StockApi)
  .addPublicApi(TagsApi)
  .setCustomTagsFn((path) => (path === '/api/slack/updateSlackList' ? ['auth']
    : [path.replace('/api/', '').split('/')[0]]))
  .build();
