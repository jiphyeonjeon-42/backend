import { pool } from '../mysql';
import * as reservationsService from './reservations.service';

describe('ReservationsServices', () => {
  afterAll(() => {
    pool.end();
  });

  it('search reservation record', async () => {
    const noQueryDefaultCase = await reservationsService.search('', 0, 5, 'all');

    // check property
    expect(noQueryDefaultCase).toHaveProperty('items');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].reservationsId');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].login');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].penaltyDays');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].title');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].image');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].callSign');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].createdAt');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].endAt');
    expect(noQueryDefaultCase).toHaveProperty('items.[0].status');
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
            reservationsId: expect.any(Number),
            login: expect.any(String),
            penaltyDays: expect.any(Number),
            image: expect.any(String),
            callSign: expect.any(String),
            title: expect.any(String),
            createdAt: expect.any(Date),
            endAt: expect.any(Date),
            status: expect.any(Number),
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

  it('search reservation record (filter)', async () => {
    const pendingCase = await reservationsService.search('', 0, 5, 'pending');
    expect(pendingCase.items[0].status).toBe(0);
    expect(pendingCase.items[0].callSign).not.toBeNull();
    const expiredCase = await reservationsService.search('', 0, 5, 'expired');
    expect(expiredCase.items[0].status).toBeGreaterThan(0);
    const waitingCase = await reservationsService.search('', 0, 5, 'waiting');
    expect(waitingCase.items[0].status).toBe(0);
    expect(waitingCase.items[0].callSign).toBeNull();
  });
  it('search reservation record (meta)', async () => {
    const { meta } = await reservationsService.search('', 4, 7, 'all');
    expect(meta.currentPage).toBe(4 + 1); // page was subtracted 1 in controller, so n + 1 is right
    expect(meta.itemsPerPage).toBe(7);
  });
  let userId = 1418;
  let bookInfoId = 4;
  it('book a book (AT_PENALTY)', async () => {
    const result = await reservationsService.create(userId, bookInfoId);
    expect(result).toBe(reservationsService.AT_PENALTY);
  });
  it('book a book (NOT_LENDED)', async () => {
    userId = 1402;
    bookInfoId = 64;
    const result = await reservationsService.create(userId, bookInfoId);
    expect(result).toBe(reservationsService.NOT_LENDED);
  });
  it('book a book (ALREADY_LENDED)', async () => {
    userId = 1408;
    bookInfoId = 1;
    const result = await reservationsService.create(userId, bookInfoId);
    expect(result).toBe(reservationsService.ALREADY_LENDED);
  });
  it('book a book (ALREADY_RESERVED)', async () => {
    userId = 1434;
    bookInfoId = 1;
    const result = await reservationsService.create(userId, bookInfoId);
    expect(result).toBe(reservationsService.ALREADY_RESERVED);
  });
  it('book a book (MORE_THAN_TWO_RESERVATIONS)', async () => {
    userId = 1410;
    bookInfoId = 1;
    const result = await reservationsService.create(userId, bookInfoId);
    expect(result).toBe(reservationsService.MORE_THAN_TWO_RESERVATIONS);
  });

  it('cancel a reservation (RESERVATION_NOT_EXIST)', async () => {
    const result = await reservationsService.cancel(1);
    expect(result).toBe(reservationsService.RESERVATION_NOT_EXIST);
  });

  it('cancel a reservation (ok)', async () => {
    const result = await reservationsService.cancel(2);
    expect(result).toBe(reservationsService.ok);
  });

  // bookId가 후순위로 넘어가야 함
  it('cancel a reservation (ok)', async () => {
    const result = await reservationsService.cancel(12);
    expect(result).toBe(reservationsService.ok);
  });

  it('reservation count (ok)', async () => {
    bookInfoId = 2;
    expect(await reservationsService.count(bookInfoId)).toEqual(
      expect.objectContaining({
        count: expect.any(Number),
      }),
    );
    bookInfoId = 4242;
  });

  it('reservation count (INVALID_INFO_ID)', async () => {
    bookInfoId = 4242;
    expect(await reservationsService.count(bookInfoId))
      .toBe(reservationsService.INVALID_INFO_ID);
  });

  it('reservation count (NOT_LENDED)', async () => {
    bookInfoId = 1;
    expect(await reservationsService.count(bookInfoId))
      .toBe(reservationsService.NOT_LENDED);
  });

  it('get user reservation', async () => {
    userId = 1402;
    expect(await reservationsService.userReservations(userId)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reservationId: expect.any(Number),
          orderOfReservation: expect.any(Number),
          reservedBookInfoId: expect.any(Number),
          title: expect.any(String),
          image: expect.any(String),
          // endAt: expect.any(Date),
          reservationDate: expect.any(Date),
        }),
      ]),
    );
  });
});
