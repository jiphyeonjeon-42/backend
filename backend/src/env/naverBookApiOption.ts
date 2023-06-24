import { envObject } from './envObject';

export const naverBookApiSchema = envObject('NAVER_BOOK_SEARCH_CLIENT_ID', 'NAVER_BOOK_SEARCH_SECRET');

export const getNaverBookApiOption = (processEnv: NodeJS.ProcessEnv) => naverBookApiSchema
  .transform((v) => ({
    client: v.NAVER_BOOK_SEARCH_CLIENT_ID,
    secret: v.NAVER_BOOK_SEARCH_SECRET,
  }))
  .parse(processEnv);
