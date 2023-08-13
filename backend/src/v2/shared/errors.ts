export class BookInfoNotFoundError extends Error {
  declare readonly _tag: 'BookInfoNotFoundError';

  constructor(bookInfoId: number) {
    super(`개별 도서 정보 (id: ${bookInfoId})를 찾을 수 없습니다`);
  }
}

export class UnauthorizedError extends Error {
  declare readonly _tag: 'UnauthorizedError';

  constructor() {
    super('권한이 없습니다');
  }
}

export class BookNotFoundError extends Error {
  declare readonly _tag: 'BookNotFoundError';

  constructor(bookId: number) {
    super(`도서 정보 (id: ${bookId})를 찾을 수 없습니다`);
  }
}
