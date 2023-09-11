/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */

export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** 서버 실행 모드, 로깅 레벨 결정 */
      NODE_ENV?: 'development' | 'production';

      /** 집현전 프론트엔드 URL */
      CLIENT_URL: string;

      /** JWT 인증 토큰 시드 */
      JWT_SECRET: string;

      /** 국립중앙도서관 ISBN 서지정보 API 키 */
      NATION_LIBRARY_KEY: string;

      /** 네이버 도서 검색 API 클라이언트 아이디 */
      NAVER_BOOK_SEARCH_CLIENT_ID: string;

      /** 네이버 도서 검색 API 시크릿 */
      NAVER_BOOK_SEARCH_SECRET: string;

      /** 집현전 슬랙봇 OAuth 인증 토큰 */
      BOT_USER_OAUTH_ACCESS_TOKEN: string;

      // 42 API
      /** 42 API OAuth 클라이언트 아이디 */
      CLIENT_ID: string;

      /** 42 API OAuth 클라이언트 시크릿 */
      CLIENT_SECRET: string;

      /** 42 API OAuth 리다이렉트 URL */
      REDIRECT_URL: string;

      /**
       * 레포지토리 선택 모드
       *
       * - local: 호스트 머신의 DB에 연결
       * - prod: 도커 컨테이너의 DB에 연결
       * - RDS: AWS RDS에 연결
       * - https: RDS + SSL에 연결
       */
      MODE: 'local' | 'RDS' | 'prod' | 'https';

      // local 또는 prod MODE에서
      /** MySQL 데이터베이스 이름 */
      MYSQL_DATABASE?: string;

      /** MySQL 데이터베이스 비밀번호 */
      MYSQL_PASSWORD?: string;

      /** MySQL 데이터베이스 사용자 이름 */
      MYSQL_USER?: string;

      // RDS 또는 https MODE에서
      /** RDS 데이터베이스 이름 */
      RDS_DB_NAME?: string;
      /** RDS 데이터베이스 주소 */
      RDS_HOSTNAME?: string;
      /** RDS 데이터베이스 비밀번호 */
      RDS_PASSWORD?: string;
      /** RDS 데이터베이스 사용자 이름 */
      RDS_USERNAME?: string;
    }
  }
}
