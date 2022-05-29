import { pool } from '../mysql';
import * as lendingsService from './lendings.service';

describe('LendingsService', () => {
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

  it('search lending record', async () => {
    const noQueryDefaultCase = await lendingsService.search('', 0, 5, 'new', 'all');

    // check property
    expect(noQueryDefaultCase).toHaveProperty('items');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].id');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].lendingCondition');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].login');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].penaltyDays');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].callSign');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].title');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].dueDate');
    expect(noQueryDefaultCase).toHaveProperty('meta');
    expect(noQueryDefaultCase).toHaveProperty('meta.totalItems');
    expect(noQueryDefaultCase).toHaveProperty('meta.itemCount');
    expect(noQueryDefaultCase).toHaveProperty('meta.itemsPerPage');
    expect(noQueryDefaultCase).toHaveProperty('meta.totalPages');
    expect(noQueryDefaultCase).toHaveProperty('meta.currentPage');

    // check type of property
    expect(typeof noQueryDefaultCase.items).toBe('object');
    expect(typeof noQueryDefaultCase.items[0].id).toBe('number');
    expect(typeof noQueryDefaultCase.items[0].lendingCondition).toBe('string');
    expect(typeof noQueryDefaultCase.items[0].login).toBe('string');
    expect(typeof noQueryDefaultCase.items[0].penaltyDays).toBe('number');
    expect(typeof noQueryDefaultCase.items[0].callSign).toBe('string');
    expect(typeof noQueryDefaultCase.items[0].title).toBe('string');
    expect(typeof noQueryDefaultCase.items[0].dueDate).toBe('string');
    expect(typeof noQueryDefaultCase.meta).toBe('object');
    expect(typeof noQueryDefaultCase.meta.totalItems).toBe('number');
    expect(typeof noQueryDefaultCase.meta.itemCount).toBe('number');
    expect(typeof noQueryDefaultCase.meta.itemsPerPage).toBe('number');
    expect(typeof noQueryDefaultCase.meta.totalPages).toBe('number');
    expect(typeof noQueryDefaultCase.meta.currentPage).toBe('number');

    // check result of sorting
    const sortNew = await lendingsService.search('', 0, 5, 'new', 'all');
    expect(sortNew.items[0].id).toBeGreaterThan(sortNew.items[4].id);
    const sortOld = await lendingsService.search('', 0, 5, 'old', 'all');
    expect(sortOld.items[0].id).toBeLessThan(sortOld.items[4].id);

    // check result of setting type
    const withQueryOnlyTitle = await lendingsService.search('개발', 0, 5, 'new', 'title');
    expect(withQueryOnlyTitle.items[0].title).toMatch(/개발/);
    const withQueryOnlyUser = await lendingsService.search('o', 0, 5, 'new', 'user');
    expect(withQueryOnlyUser.items[0].login).toMatch(/o/);
    const withQueryOnlyCallSign = await lendingsService.search('c', 0, 5, 'new', 'callSign');
    expect(withQueryOnlyCallSign.items[0].callSign).toMatch(/c/);

    // check basic values of meta
    const { meta } = await lendingsService.search('', 4, 7, 'new', 'all');
    expect(meta.currentPage).toBe(4 + 1); // page was subtracted 1 in controller, so n + 1 is right
    expect(meta.itemsPerPage).toBe(7);
  });

  it('detail of lending :ledingId ', async () => {
    const validId = await lendingsService.lendingId(137);
    // check property
    expect(validId).toHaveProperty('id');
    expect(validId).toHaveProperty('lendingCondition');
    expect(validId).toHaveProperty('login');
    expect(validId).toHaveProperty('penaltyDays');
    expect(validId).toHaveProperty('callSign');
    expect(validId).toHaveProperty('title');
    expect(validId).toHaveProperty('image');
    expect(validId).toHaveProperty('dueDate');

    // check type of property
    expect(typeof validId.id).toBe('number');
    expect(typeof validId.lendingCondition).toBe('string');
    expect(typeof validId.login).toBe('string');
    expect(typeof validId.penaltyDays).toBe('number');
    expect(typeof validId.callSign).toBe('string');
    expect(typeof validId.title).toBe('string');
    expect(typeof validId.image).toBe('string');
    expect(typeof validId.dueDate).toBe('string');

    const invalidId = await lendingsService.lendingId(13);
    expect(invalidId).toBeUndefined();
  });

  it('return a book', async () => {
    let lendingId = 144;
    const librarianId = 1410;
    const condition = '이상없음';
    expect(await lendingsService.returnBook(lendingId, librarianId, condition))
      .toBe(lendingsService.ok);
    expect(await lendingsService.returnBook(lendingId, librarianId, condition))
      .toBe(lendingsService.alreadyReturned);
    lendingId = 1000;
    expect(await lendingsService.returnBook(lendingId, librarianId, condition))
      .toBe(lendingsService.nonexistentLending);
    // 예약 생성 확인은 어떻게?
  });
});
