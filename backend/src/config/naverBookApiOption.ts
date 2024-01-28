/* eslint-disable import/prefer-default-export */
import { NaverBookApiOption } from './config.type';
import { envObject } from './envObject';

const naverBookApiSchema = envObject(
  'NAVER_BOOK_SEARCH_CLIENT_ID',
  'NAVER_BOOK_SEARCH_SECRET',
).transform((v) => ({
  client: v.NAVER_BOOK_SEARCH_CLIENT_ID,
  secret: v.NAVER_BOOK_SEARCH_SECRET,
}));

export const getNaverBookApiOption = (processEnv: NodeJS.ProcessEnv): NaverBookApiOption => {
  const option = naverBookApiSchema.parse(processEnv);

  return option;
};
