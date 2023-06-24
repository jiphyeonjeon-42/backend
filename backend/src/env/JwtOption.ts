import { z } from 'zod';
import { nonempty } from './envObject';
import { Mode } from './modeSchema';
import { OauthUrlOption } from './oauth42ApiSchema';

export type JwtOption = {
  issuer: string | 'localhost'
  domain: string | 'localhost'

  /** Secure Cookie에 저장하므로 https 연결시에만 참이어야 함 */
  secure: boolean;
};

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
