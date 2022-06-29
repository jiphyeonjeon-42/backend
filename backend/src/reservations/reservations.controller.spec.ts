import * as status from 'http-status';
import { pool } from '../mysql';
import * as reservationsController from './reservations.controller';

describe('ReservationsController', () => {
  afterAll(() => {
    pool.end();
  });

  const mockReq = () => {
    const req: any = {};
    req.body = {};
    req.user = {};
    req.params = {};
    req.query = {};
    return req;
  };
  const mockResp = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const req = mockReq();
  const next = jest.fn();

  it('reservations create failed 0', async () => {
    const res = mockResp();
    req.body.bookInfoId = '999999';
    req.user.id = 1408;
    req.user.role = 2;
    await reservationsController.create(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(0);
  });
  it('reservations create failed 1', async () => {
    const res = mockResp();
    req.body.bookInfoId = '18';
    req.user.id = 1408;
    req.user.role = 2;
    await reservationsController.create(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(1);
  });
  it('reservations create failed 2', async () => {
    const res = mockResp();
    req.body.bookInfoId = '12';
    req.user.id = 1444;
    req.user.role = 2;
    await reservationsController.create(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(2);
  });
  it('reservations create failed 3', async () => {
    const res = mockResp();
    req.body.bookInfoId = '2';
    req.user.id = 1411;
    req.user.role = 2;
    await reservationsController.create(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(3);
  });
  it('reservations create failed 4', async () => {
    const res = mockResp();
    req.body.bookInfoId = '3';
    req.user.id = 1409;
    req.user.role = 2;
    await reservationsController.create(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(4);
  });

  it('reservation cancel failed 1', async () => {
    const res = mockResp();
    req.params.reservationId = '2';
    req.user.id = 1403;
    req.user.role = 1;
    await reservationsController.cancel(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(1);
  });
  it('reservation cancel failed 2', async () => {
    const res = mockResp();
    req.params.reservationId = '3333';
    req.user.id = 1403;
    req.user.role = 1;
    await reservationsController.cancel(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(2);
  });
  it('reservation cancel failed 2 with librarian permission', async () => {
    const res = mockResp();
    req.params.reservationId = '3333';
    req.user.id = 1403;
    req.user.role = 3;
    await reservationsController.cancel(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(2);
  });
  it('reservation cancel failed 2', async () => {
    const res = mockResp();
    req.params.reservationId = '12';
    req.user.id = 1403;
    req.user.role = 3;
    await reservationsController.cancel(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(3);
  });

  it('reservation search success', async () => {
    const res = mockResp();
    req.query.query = '';
    req.query.page = 'a';
    req.query.limit = '5';
    req.query.filter = 'all';
    await reservationsController.search(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.OK);
    expect(res.json.mock.calls[0][0]).toHaveProperty('items');
    expect(res.json.mock.calls[0][0]).toHaveProperty('meta');
  });

  it('reservation search failed wrong filter', async () => {
    const res = mockResp();
    req.query.query = '';
    req.query.page = '0';
    req.query.limit = '5';
    req.query.filter = 'every';
    await reservationsController.search(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]).toBe(0);
  });

  it('reservation count (ok)', async () => {
    const res = mockResp();
    req.query.bookInfo = '1';
    req.user.role = 0;
    await reservationsController.count(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.OK);
    expect(res.json.mock.calls[0][0]?.errorCode).toEqual(
      expect.objectContaining({
        count: expect.any(Number),
      }),
    );
  });

  it('reservation count failed 0 (1)', async () => {
    const res = mockResp();
    req.query.bookInfo = '424242';
    req.user.role = 0;
    await reservationsController.count(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(0);
  });

  it('reservation count failed 0 (2)', async () => {
    const res = mockResp();
    req.query.bookInfo = 'aaa';
    req.user.role = 0;
    await reservationsController.count(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(0);
  });

  it('reservation count failed 0 (2)', async () => {
    const res = mockResp();
    req.query.bookInfo = 'aaa';
    req.user.role = 0;
    await reservationsController.count(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(0);
  });

  it('reservation count failed 1', async () => {
    const res = mockResp();
    req.query.bookInfo = '2';
    req.user.role = 0;
    await reservationsController.count(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(1);
  });

  it('get user reservation (OK)', async () => {
    const res = mockResp();
    req.user.id = 1412;
    await reservationsController.userReservations(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.OK);
    expect(res.json.mock.calls[0][0]).toEqual(
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

  it('get user reservation failed 0', async () => {
    const res = mockResp();
    req.user.id = 'asdf';
    await reservationsController.userReservations(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(0);
  });
});
