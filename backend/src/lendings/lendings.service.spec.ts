import { pool } from '../mysql';
import * as lendingsService from './lendings.service';

describe('LendingsService', () => {
  afterAll(() => {
    pool.end();
  });

  let userId = 1;
  let bookId = 147;
  const librarianId = 1440;
  const condition = '이상없음';

  it('lend a book (success)', async () => {
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.noUserId);
  });
  it('lend a book (noPermission)', async () => {
    userId = 1392;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.noPermission);
  });
  it('lend a book (lendingOverload)', async () => {
    userId = 1408;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.lendingOverload);
  });
  it('lend a book (lendingOverdue)', async () => {
    userId = 1418;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.lendingOverdue);
  });
  it('lend a book (onLending)', async () => {
    userId = 1444;
    bookId = 1;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.onLending);
  });
  it('lend a book (onReservation)', async () => {
    bookId = 82;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.onReservation);
  });
  it('lend a book (lostBook)', async () => {
    bookId = 859;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.lostBook);
  });
  it('lend a book (damagedBook)', async () => {
    bookId = 858;
    expect(await lendingsService.create(userId, bookId, librarianId, condition))
      .toBe(lendingsService.damagedBook);
  });

  it('search lending record (success)', async () => {
    const noQueryDefaultCase = await lendingsService.search('', 0, 1, 'new', 'all');

    // check property
    expect(noQueryDefaultCase).toHaveProperty('items');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].id');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].lendingCondition');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].login');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].penaltyDays');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].callSign');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].title');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].createdAt');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].dueDate');
    expect(noQueryDefaultCase).toHaveProperty('meta');
    expect(noQueryDefaultCase).toHaveProperty('meta.totalItems');
    expect(noQueryDefaultCase).toHaveProperty('meta.itemCount');
    expect(noQueryDefaultCase).toHaveProperty('meta.itemsPerPage');
    expect(noQueryDefaultCase).toHaveProperty('meta.totalPages');
    expect(noQueryDefaultCase).toHaveProperty('meta.currentPage');

    // check type of property
    expect(noQueryDefaultCase).toEqual(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            lendingCondition: expect.any(String),
            login: expect.any(String),
            penaltyDays: expect.any(Number),
            callSign: expect.any(String),
            title: expect.any(String),
            createdAt: expect.any(Date),
            dueDate: expect.any(Date),
          }),
        ]),
        meta: expect.objectContaining({
          totalItems: expect.any(Number),
          itemCount: expect.any(Number),
          itemsPerPage: expect.any(Number),
          totalPages: expect.any(Number),
          currentPage: expect.any(Number),
        }),
      }),
    );
  });

  it('search lending record (sort)', async () => {
    const sortNew = await lendingsService.search('', 0, 5, 'new', 'all');
    expect(sortNew?.items[0]?.createdAt > sortNew?.items[4]?.createdAt).toBeTruthy();
    const sortOld = await lendingsService.search('', 0, 5, 'old', 'all');
    expect(sortOld?.items[0]?.createdAt < sortOld?.items[4]?.createdAt).toBeTruthy();
  });

  it('search lending record (setting type)', async () => {
    const withQueryOnlyTitle = await lendingsService?.search('개발', 0, 5, 'new', 'title');
    expect(withQueryOnlyTitle?.items[0]?.title).toMatch(/개발/);
    const withQueryOnlyUser = await lendingsService?.search('o', 0, 5, 'new', 'user');
    expect(withQueryOnlyUser?.items[0]?.login).toMatch(/o/);
    const withQueryOnlyCallSign = await lendingsService?.search('c', 0, 5, 'new', 'callSign');
    expect(withQueryOnlyCallSign?.items[0]?.callSign).toMatch(/c/);
  });

  it('search lending record (meta)', async () => {
    const { meta } = await lendingsService.search('', 4, 7, 'new', 'all');
    expect(meta.currentPage).toBe(4 + 1); // page was subtracted 1 in controller, so n + 1 is right
    expect(meta.itemsPerPage).toBe(7);
  });

  it('detail of lending :lendingId (success) ', async () => {
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
    expect(typeof validId?.id).toBe('number');
    expect(typeof validId?.lendingCondition).toBe('string');
    expect(typeof validId?.login).toBe('string');
    expect(typeof validId?.penaltyDays).toBe('number');
    expect(typeof validId?.callSign).toBe('string');
    expect(typeof validId?.title).toBe('string');
    expect(typeof validId?.image).toBe('string');
    expect(typeof validId?.dueDate).toBe('string');
  });

  it('detail of lending :lendingId (invalidId) ', async () => {
    const invalidId = await lendingsService.lendingId(13);
    expect(invalidId).toBeUndefined();
  });

  // return a book
  let lendingId = 135;

  it('return a book (ok)', async () => {
    expect(await lendingsService.returnBook(librarianId, lendingId, condition))
      .toBe(lendingsService.ok);
  });

  it('return a book (alreadyReturned)', async () => {
    expect(await lendingsService.returnBook(librarianId, lendingId, condition))
      .toBe(lendingsService.alreadyReturned);
  });

  it('return a book (nonexistentLending)', async () => {
    lendingId = 1000;
    expect(await lendingsService.returnBook(librarianId, lendingId, condition))
      .toBe(lendingsService.nonexistentLending);
  });
});
