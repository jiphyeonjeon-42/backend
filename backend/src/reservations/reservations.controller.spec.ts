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
    return req;
  };
  const mockResp = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const req = mockReq();
  const res = mockResp();
  const next = jest.fn();

  it('reservations create failed 0', async () => {
    req.body.bookInfoId = '999999';
    req.user.id = 1408;
    req.user.role = 2;
    await reservationsController.create(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0]?.errorCode).toBe(0);
  });
  it('reservations create failed 1', async () => {
    req.body.bookInfoId = '18';
    req.user.id = 1408;
    req.user.role = 2;
    await reservationsController.create(req, res, next);
    expect(res.status.mock.calls[1][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[1][0]?.errorCode).toBe(1);
  });
  it('reservations create failed 2', async () => {
    req.body.bookInfoId = '12';
    req.user.id = 1444;
    req.user.role = 2;
    await reservationsController.create(req, res, next);
    expect(res.status.mock.calls[2][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[2][0]?.errorCode).toBe(2);
  });
  it('reservations create failed 3', async () => {
    req.body.bookInfoId = '2';
    req.user.id = 1411;
    req.user.role = 2;
    await reservationsController.create(req, res, next);
    expect(res.status.mock.calls[3][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[3][0]?.errorCode).toBe(3);
  });
  it('reservations create failed 4', async () => {
    req.body.bookInfoId = '3';
    req.user.id = 1409;
    req.user.role = 2;
    await reservationsController.create(req, res, next);
    expect(res.status.mock.calls[4][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[4][0]?.errorCode).toBe(4);
  });

  it('reservation cancel failed 1', async () => {
    req.params.reservationId = '2';
    req.user.id = 1403;
    req.user.role = 1;
    await reservationsController.cancel(req, res, next);
    expect(res.status.mock.calls[5][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[5][0]?.errorCode).toBe(1);
  });
  it('reservation cancel failed 2', async () => {
    req.params.reservationId = '3333';
    req.user.id = 1403;
    req.user.role = 1;
    await reservationsController.cancel(req, res, next);
    expect(res.status.mock.calls[6][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[6][0]?.errorCode).toBe(2);
  });
  it('reservation cancel failed 2 with librarian permission', async () => {
    req.params.reservationId = '3333';
    req.user.id = 1403;
    req.user.role = 3;
    await reservationsController.cancel(req, res, next);
    expect(res.status.mock.calls[7][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[7][0]?.errorCode).toBe(2);
  });
  it('reservation cancel failed 2', async () => {
    req.params.reservationId = '12';
    req.user.id = 1403;
    req.user.role = 3;
    await reservationsController.cancel(req, res, next);
    expect(res.status.mock.calls[8][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[8][0]?.errorCode).toBe(3);
  });
});
