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
import type { CookieOptions } from 'express';

export * as logFormatOption from './logOption';

export * as logFormatOption from './logOption';

// .env 파일을 읽어서 process.env에 추가
dotenv.config();

const runtimeMode = getRuntimeMode(process.env);

// graceful shutdown시 서버 종료 대기 시간
export const gracefulTerminationTimeout = runtimeMode === 'production' ? 30 * 1000 : 0;

export const logLevelOption = getLogLevelOption(runtimeMode);
export const connectMode = getModeOption(process.env);
export const connectOption = getConnectOption(connectMode)(process.env);
export const oauthUrlOption = getOauthUrlOption(process.env);
export const oauth42ApiOption = getOauth42ApiOption(process.env);
export const naverBookApiOption = getNaverBookApiOption(process.env);

/** 국립중앙도서관 ISBN 서지정보 API 키 */
export const nationalIsbnApiKey = getNationalIsbnApiOption(process.env);

/** 집현전 슬랙봇 OAuth 인증 토큰 */
export const botOAuthToken = getSlackbotOAuthToken(process.env);

export const jwtOption = {
  ...getJwtOption(connectMode)(oauthUrlOption),

  /** JWT 인증 토큰 시드 */
  secret: getJwtSecret(process.env),
};

/**
 * `path` 와 `domain`은 쿠키 설정시와 삭제시 같아야 합니다.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#third-party_cookies | MDN#Third-party cookies}
 */
export const cookieOptions = {
  /** 브라우저에서만 쿠키를 사용할 수 있게 설정 */
  httpOnly: true,
  path: '/',
  domain: jwtOption.domain,
  /** https 에서만 사용할 수 있도록 설정 */
  secure: jwtOption.secure,
  /** 같은 도메인의에서만 쿠키를 사용할 수 있는 'strict' 값 설정 */
  sameSite: 'lax',
} satisfies CookieOptions;
