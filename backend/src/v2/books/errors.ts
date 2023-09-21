export class PubdateFormatError extends Error {
  declare readonly _tag: 'FormatError';

  constructor(exp: string) {
    super(`${exp}가 지정된 포맷과 일치하지 않습니다.`);
  }
}

export class IsbnNotFoundError extends Error {
  declare readonly _tag: 'ISBN_NOT_FOUND';

  constructor(exp: string) {
    super(`국립중앙도서관 API에서 ISBN(${exp}) 검색이 실패하였습니다.`);
  }
}

export class NaverBookNotFound extends Error {
  declare readonly _tag: 'NAVER_BOOK_NOT_FOUND';

  constructor(exp: string) {
    super(`네이버 책검색 API에서 ISBN(${exp}) 검색이 실패하였습니다.`);
  }
}
