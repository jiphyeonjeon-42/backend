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
});
