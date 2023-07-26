export class BookInfoNotFoundError extends Error {
  declare readonly _tag: 'BookInfoNotFoundError';

  constructor(bookInfoId: number) {
    super(`개별 도서 정보 (id: ${bookInfoId})를 찾을 수 없습니다`);
  }
}
