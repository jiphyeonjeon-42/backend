import { z } from 'zod';
import { nonempty } from './envObject';

export const oauth42Schema = z.object({
  CLIENT_ID: nonempty,
  CLIENT_SECRET: nonempty,
  REDIRECT_URL: nonempty.default('https://server.42library.kr'),
  CLIENT_URL: nonempty.default('https://42library.kr'),
});

export const getOauth42ApiOption = (processEnv: NodeJS.ProcessEnv) => oauth42Schema
  .transform((v) => ({
    id: v.CLIENT_ID,
    secret: v.CLIENT_SECRET,
    redirectURL: v.REDIRECT_URL,
    clientURL: v.CLIENT_URL,
  })).parse(processEnv);
