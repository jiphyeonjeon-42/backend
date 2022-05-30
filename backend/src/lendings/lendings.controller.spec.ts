import * as status from 'http-status';
import { pool } from '../mysql';
import * as lendingsController from './lendings.controller';

describe('LendingsController', () => {
  afterAll(() => {
    pool.end();
  });

  const mockReq = () => {
    const req: any = {};
    req.body = {};
    req.user = {};
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

  it('lending create failed 1', async () => {
    req.body.userId = 1111;
    req.body.bookId = 33;
    req.body.condition = '이상없음';
    req.user.id = 1410;
    req.user.role = 3;

    await lendingsController.create(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[0][0].errorCode).toBe(1);
  });
  it('lending create failed 2', async () => {
    req.body.userId = 1392;
    req.body.bookId = 33;
    req.body.condition = '이상없음';
    req.user.id = 1410;
    req.user.role = 3;

    await lendingsController.create(req, res, next);
    expect(res.status.mock.calls[1][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[1][0].errorCode).toBe(2);
  });
  it('lending create failed 3', async () => {
    req.body.userId = 1444;
    req.body.bookId = 33;
    req.body.condition = '이상없음';
    req.user.id = 1410;
    req.user.role = 3;

    await lendingsController.create(req, res, next);
    expect(res.status.mock.calls[2][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[2][0].errorCode).toBe(3);
  });
  it('lending create failed 4', async () => {
    req.body.userId = 1418;
    req.body.bookId = 33;
    req.body.condition = '이상없음';
    req.user.id = 1410;
    req.user.role = 3;

    await lendingsController.create(req, res, next);
    expect(res.status.mock.calls[3][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[3][0].errorCode).toBe(4);
  });
  it('lending create failed 5', async () => {
    req.body.userId = 1413;
    req.body.bookId = 2;
    req.body.condition = '이상없음';
    req.user.id = 1410;
    req.user.role = 3;

    await lendingsController.create(req, res, next);
    expect(res.status.mock.calls[4][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[4][0].errorCode).toBe(5);
  });
  it('lending create failed 6', async () => {
    req.body.userId = 1413;
    req.body.bookId = 82;
    req.body.condition = '이상없음';
    req.user.id = 1410;
    req.user.role = 3;

    await lendingsController.create(req, res, next);
    expect(res.status.mock.calls[5][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[5][0].errorCode).toBe(6);
  });
  it('lending create failed 7', async () => {
    req.body.userId = 1413;
    req.body.bookId = 859;
    req.body.condition = '이상없음';
    req.user.id = 1410;
    req.user.role = 3;

    await lendingsController.create(req, res, next);
    expect(res.status.mock.calls[6][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[6][0].errorCode).toBe(7);
  });
  it('lending create failed 8', async () => {
    req.body.userId = 1413;
    req.body.bookId = 858;
    req.body.condition = '이상없음';
    req.user.id = 1410;
    req.user.role = 3;

    await lendingsController.create(req, res, next);
    expect(res.status.mock.calls[7][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[7][0].errorCode).toBe(8);
  });
});
