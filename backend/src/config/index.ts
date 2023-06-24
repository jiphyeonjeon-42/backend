import dotenv from 'dotenv';
import { getJwtOption, getJwtSecret } from './JwtOption';
import { getConnectOption } from './getConnectOption';
import { getLogLevelOption } from './logOption';
import { getModeOption } from './modeOption';
import { getNationalIsbnApiOption } from './nationalIsbnApiOption';
import { getNaverBookApiOption } from './naverBookApiOption';
import { getOauth42ApiOption, getOauthUrlOption } from './oauthOption';
import { getRuntimeMode } from './runtimeOption';
import { getSlackbotOAuthToken } from './slackbotOAuthTokenOption';

// .env 파일을 읽어서 process.env에 추가
dotenv.config();

export const runtimeMode = getRuntimeMode(process.env);
export const connectMode = getModeOption(process.env);
export const connectOption = getConnectOption(connectMode)(process.env);
export const oauthUrlOption = getOauthUrlOption(process.env);
export const oauth42ApiOption = getOauth42ApiOption(process.env);
export const naverBookApiOption = getNaverBookApiOption(process.env);
export const nationalIsbnApiKey = getNationalIsbnApiOption(process.env);
export const botOAuthToken = getSlackbotOAuthToken(process.env);
export const jwtOption = {
  ...getJwtOption(connectMode)(oauthUrlOption),
  secret: getJwtSecret(process.env),
};
export const logLevelOption = getLogLevelOption(runtimeMode);
