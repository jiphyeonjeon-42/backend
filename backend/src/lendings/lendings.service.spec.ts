import { pool } from '../mysql';
import * as lendingsService from './lendings.service';

describe('BooksService', () => {
  afterAll(() => {
    pool.end();
  });

  it('lend a book', async () => {
    let userId = 1;
    let bookId = 147;
    const librarianId = 1410;
    const condition = '이상없음';
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.noUserId);
    userId = 1392;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.noPermission);
    userId = 1408;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.lendingOverload);
    userId = 1418;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.lendingOverdue);
    userId = 1444;
    bookId = 1;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.onLending);

    bookId = 83;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.onReservation);

    bookId = 858;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.lostBook);
    bookId = 859;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.damagedBook);
  });
});
