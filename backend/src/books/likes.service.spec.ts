import * as BooksService from './books.service';
import * as errorCode from '../utils/error/errorCode';

describe('createLike()', () => {
  afterAll(async () => {
    await BooksService.deleteLike(1, 1);
  });
  beforeAll(async () => {
    await BooksService.deleteLike(1, 1);
  });

  // test('fail case 1 by try-catch', async () => {
  //   try {
  //     await BooksService.createLike(1, 1);
  //   } catch (error : any) {
  //     expect(error.message).toEqual(errorCode.ALREADY_LIKES);
  //   }
  // });

  // TODO: createLike의 케이스들 나누어두기
  test('success case. like 생성', async () => {
    await expect(BooksService.createLike(1, 1)).resolves.toEqual({
      userId: 1,
      bookInfoId: 1,
    });
  });

  test('fail case 1. 이미 like가 존재합니다.', async () => {
    await expect(BooksService.createLike(1, 1)).rejects.toThrow(new Error(errorCode.ALREADY_LIKES));
  });

  test('fail case 2. bookInfoId가 유효하지 않습니다.', async () => {
    await expect(BooksService.createLike(1, 9999))
      .rejects.toThrow(new Error(errorCode.INVALID_INFO_ID_LIKES));
  });
});
