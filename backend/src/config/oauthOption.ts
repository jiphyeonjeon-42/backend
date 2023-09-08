import { z } from 'zod';
import { Oauth42ApiOption, OauthUrlOption } from './config.type';
import { nonempty, url } from './envObject';

export const oauthUrlSchema = z.object({
  REDIRECT_URL: url.default('https://server.42library.kr'),
  GOOGLE_REDIRECT_URL: url.default('https://server.42library.kr/google'),
  CLIENT_URL: url.default('https://42library.kr'),
});

export const oauth42Schema = z.object({
  CLIENT_ID: nonempty,
  CLIENT_SECRET: nonempty,
  GOOGLE_CLIENT_ID: nonempty,
  GOOGLE_CLIENT_SECRET: nonempty,
});

export const getOauthUrlOption = (processEnv: NodeJS.ProcessEnv): OauthUrlOption =>
  oauthUrlSchema
    .transform((v) => ({
      redirectURL: v.REDIRECT_URL,
      clientURL: v.CLIENT_URL,
    }))
    .parse(processEnv);

export const getGoogleOauthUrlOption = (processEnv: NodeJS.ProcessEnv): OauthUrlOption =>
  oauthUrlSchema
    .transform((v) => ({
      redirectURL: v.GOOGLE_REDIRECT_URL,
      clientURL: v.CLIENT_URL,
    }))
    .parse(processEnv);

// eslint-disable-next-line max-len
export const getOauth42ApiOption = (processEnv: NodeJS.ProcessEnv): Oauth42ApiOption =>
  oauth42Schema
    .transform((v) => ({
      id: v.CLIENT_ID,
      secret: v.CLIENT_SECRET,
    }))
    .parse(processEnv);

export const getGoogleOauthApiOption = (processEnv: NodeJS.ProcessEnv): Oauth42ApiOption =>
  oauth42Schema
    .transform((v) => ({
      id: v.GOOGLE_CLIENT_ID,
      secret: v.GOOGLE_CLIENT_SECRET,
    }))
    .parse(processEnv);