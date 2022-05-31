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
    req.params = {};
    req.query = jest.fn().mockReturnValue(req);
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

  // it('success create lending', async () => {
  //   req.body.userId = 1444;
  //   req.body.bookId = 34;
  //   req.body.condition = '이상없음';
  //   req.user.id = 1410;
  //   req.user.role = 3;
  //   await lendingsController.create(req, res, next);
  //   expect(res.status.mock.calls[0][0]).toBe(status.OK);
  // });

  // it('failed 1', async () => {
  //   req.body.userId = 1111;
  //   req.body.bookId = 33;
  //   req.body.condition = '이상없음';
  //   req.user.id = 2;
  //   req.user.role = 3;

  //   await lendingsController.create(req, res, next);
  //   expect(res.status.mock.calls[1][0]).toBe(status.BAD_REQUEST);
  //   expect(res.json.mock.calls[1][0]?.errorCode).toBe(2);
  // });

  it('lending search success', async () => {
    req.query.query = 'e';
    req.query.page = '0';
    req.query.limit = '1';
    req.query.sort = 'new';
    req.query.type = 'title';
    await lendingsController.search(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.OK);
    expect(res.json.mock.calls[0][0]).toHaveProperty('items');
    expect(res.json.mock.calls[0][0]).toHaveProperty('meta');
  });

  it('lending search failed if sort is unknown value', async () => {
    req.query.query = 'e';
    req.query.page = '0';
    req.query.limit = '5';
    req.query.sort = 'every';
    req.query.type = 'all';
    await lendingsController.search(req, res, next);
    expect(res.status.mock.calls[1][0]).toBe(status.BAD_REQUEST);
  });

  it('lending search failed if sort is unknown value', async () => {
    req.query.query = 'e';
    req.query.page = '0';
    req.query.limit = '5';
    req.query.sort = 'new';
    req.query.type = 'time';
    await lendingsController.search(req, res, next);
    expect(res.status.mock.calls[2][0]).toBe(status.BAD_REQUEST);
  });

  it('lendingid success', async () => {
    req.params.id = '137';
    await lendingsController.lendingId(req, res, next);
    expect(res.status.mock.calls[3][0]).toBe(status.OK);
    expect(res.json.mock.calls[1][0]).toHaveProperty('id');
  });

  it('lendingid failed invalid id', async () => {
    req.params.id = '1370';
    await lendingsController.lendingId(req, res, next);
    expect(res.status.mock.calls[4][0]).toBe(status.BAD_REQUEST);
  });
});
