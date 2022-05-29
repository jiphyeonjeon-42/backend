import { pool } from '../mysql';
import * as reservationsService from './reservations.service';

describe('ReservationsService', () => {
  afterAll(() => {
    pool.end();
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
});
