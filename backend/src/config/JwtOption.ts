import { z } from 'zod';
import { JwtOption, OauthUrlOption } from './config.type';
import { nonempty } from './envObject';
import { Mode } from './modeOption';
import { match } from 'ts-pattern';

type getJwtOption = (mode: Mode) => (option: OauthUrlOption) => JwtOption;
export const getJwtOption: getJwtOption = (mode) => ({ redirectURL, clientURL }) => {
  const redirectDomain = new URL(redirectURL).hostname;
  const clientDomain = new URL(clientURL).hostname;
  const secure = mode === 'prod' || mode === 'https';

  const issuer = secure ? redirectDomain : 'localhost';
  const domain = match(mode)
    .with('prod', () => clientDomain)
    .with('https', () => undefined)
    .otherwise(() => 'localhost');

  return { issuer, domain, secure };
};

export const jwtSecretSchema = z.object({ JWT_SECRET: nonempty }).transform((v) => v.JWT_SECRET);

export const getJwtSecret = (processEnv: NodeJS.ProcessEnv) => jwtSecretSchema.parse(processEnv);
