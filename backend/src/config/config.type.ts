import { levels } from './logOption';

/** JWT 발급 옵션 */
export type JwtOption = {
  /** JWT 발급자 */
  issuer: string | 'localhost';

  /** JWT 도메인 */
  domain: string | 'localhost' | undefined;

  /** Cookie Secure 사용 여부 */
  secure: boolean;
};

/** 네이버 도서 검색 API 옵션 */
export type NaverBookApiOption = {
  /** 네이버 도서 검색 API 클라이언트 아이디 */
  client: string;

  /** 네이버 도서 검색 API 시크릿 */
  secret: string;
};

/** DB 연결 옵션 */
export type ConnectOption = {
  /** DB 호스트명/주소 */
  host: string;

  /** DB 사용자 이름 */
  username: string;

  /** DB 비밀번호 */
  password: string;

  /** DB 이름 */
  database: string;
};

/** OAuth URL 옵션 */
export type OauthUrlOption = {
  /** 42 API OAuth 리다이렉트 URL */
  redirectURL: string;

  /** 집현전 프론트엔드 URL */
  clientURL: string;
};

/** 42 API OAuth 클라이언트 인증 정보 */
export type Oauth42ApiOption = {
  /** 42 API OAuth 클라이언트 아이디 */
  id: string;

  /** 42 API OAuth 클라이언트 시크릿 */
  secret: string;
};

/** npm 로깅 레벨 */
export type LogLevel = keyof typeof levels;

/** 서버 로깅 옵션 */
export type LogLevelOption = {
  /** 파일 로깅 레벨 */
  readonly logLevel: 'http' | 'debug';

  /** 콘솔 로깅 레벨 */
  readonly consoleLogLevel: 'error' | 'debug';
};
