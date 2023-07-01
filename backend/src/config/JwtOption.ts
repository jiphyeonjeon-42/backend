import { z } from 'zod';
import { JwtOption, OauthUrlOption } from './config.type';
import { nonempty } from './envObject';
import { Mode } from './modeOption';

type getJwtOption = (mode: Mode) => (option: OauthUrlOption) => JwtOption;
export const getJwtOption: getJwtOption = (mode) => ({ redirectURL, clientURL }) => {
  const redirectDomain = new URL(redirectURL).hostname;
  const clientDomain = new URL(clientURL).hostname;

  const issuer = mode === 'local' ? 'localhost' : redirectDomain;
  const domain = mode === 'prod' ? clientDomain : 'localhost';
  const secure = mode === 'prod';

  return { issuer, domain, secure };
};

export const jwtSecretSchema = z.object({ JWT_SECRET: nonempty }).transform((v) => v.JWT_SECRET);

export const getJwtSecret = (processEnv: NodeJS.ProcessEnv) => jwtSecretSchema.parse(processEnv);
