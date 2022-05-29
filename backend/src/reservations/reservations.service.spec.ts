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

    console.log(noQueryDefaultCase);
    // check type of property
    expect(typeof noQueryDefaultCase.items).toBe('object');
    expect(typeof noQueryDefaultCase.items[0].reservationsId).toBe('number');
    expect(typeof noQueryDefaultCase.items[0].login).toBe('string');
    expect(typeof noQueryDefaultCase.items[0].penaltyDays).toBe('number');
    expect(typeof noQueryDefaultCase.items[0].title).toBe('string');
    expect(typeof noQueryDefaultCase.items[0].image).toBe('string');
    expect(typeof noQueryDefaultCase.items[0].createdAt).toBe('string');
    // expect(typeof noQueryDefaultCase.items[0].callSign).toBe('string'); // string OR null(object)
    // expect(typeof noQueryDefaultCase.items[0].endAt).toBe('string');  // string OR null(object)
    expect(typeof noQueryDefaultCase.items[0].status).toBe('number');
    expect(typeof noQueryDefaultCase.meta).toBe('object');
    expect(typeof noQueryDefaultCase.meta.totalItems).toBe('number');
    expect(typeof noQueryDefaultCase.meta.itemCount).toBe('number');
    expect(typeof noQueryDefaultCase.meta.itemsPerPage).toBe('number');
    expect(typeof noQueryDefaultCase.meta.totalPages).toBe('number');
    expect(typeof noQueryDefaultCase.meta.currentPage).toBe('number');

    // // check result of setting filter
    const pendingCase = await reservationsService.search('', 0, 5, 'pending');
    expect(pendingCase.items[0].status).toBe(0);
    expect(pendingCase.items[0].callSign).not.toBeNull();
    const expiredCase = await reservationsService.search('', 0, 5, 'expired');
    expect(expiredCase.items[0].status).toBeGreaterThan(0);
    const waitingCase = await reservationsService.search('', 0, 5, 'waiting');
    expect(waitingCase.items[0].status).toBe(0);
    expect(waitingCase.items[0].callSign).toBeNull();

    // check basic values of meta
    const { meta } = await reservationsService.search('', 4, 7, 'all');
    expect(meta.currentPage).toBe(4 + 1); // page was subtracted 1 in controller, so n + 1 is right
    expect(meta.itemsPerPage).toBe(7);
  });

  it('book a book', async () => {
    let userId = 1418;
    let bookInfoId = 4;
    let result = await reservationsService.create(userId, bookInfoId);
    expect(result).toBe(reservationsService.atPenalty);
    userId = 1402;
    bookInfoId = 64;
    result = await reservationsService.create(userId, bookInfoId);
    expect(result).toBe(reservationsService.notLended);
    userId = 1408;
    bookInfoId = 1;
    result = await reservationsService.create(userId, bookInfoId);
    expect(result).toBe(reservationsService.alreadyLended);
    userId = 1434;
    bookInfoId = 1;
    result = await reservationsService.create(userId, bookInfoId);
    expect(result).toBe(reservationsService.alreadyReserved);
    userId = 1410;
    bookInfoId = 1;
    result = await reservationsService.create(userId, bookInfoId);
    expect(result).toBe(reservationsService.moreThanTwoReservations);
  });

  it('cancel a reservation', async () => {
    let result = await reservationsService.cancel(1);
    expect(result).toBe(reservationsService.reservationNotExist);
    result = await reservationsService.cancel(2);
    expect(result).toBe(reservationsService.ok);
    result = await reservationsService.cancel(12);
    expect(result).toBe(reservationsService.ok);
  });

  it('reservation count', async () => {
    let bookInfoId = '2';
    expect(await reservationsService.count(bookInfoId)).toEqual(
      expect.objectContaining({
        count: expect.any(String),
      }),
    );
    bookInfoId = '4242';
    expect(await reservationsService.count(bookInfoId))
      .toBe(reservationsService.invalidBookInfoId);
    bookInfoId = '42';
    expect(await reservationsService.count(bookInfoId))
      .toBe(reservationsService.availableLoan);
  });

  it('get user reservation', async () => {
    const userId = '1407';
    expect(await reservationsService.userReservations(userId)).toEqual(
      expect.arrayContaining(
        expect.objectContaining({
          reservationId: expect.any(BigInt), // BigInt..?
          orderOfReservation: expect.any(BigInt),
          bookInfoID: expect.any(BigInt),
          title: expect.any(String),
          image: expect.any(String),
          endAt: expect.any(Date),
        }),
      ),
    );
  });
});
