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

  it('success create lending', async () => {
    req.body.userId = 1444;
    req.body.bookId = 34;
    req.body.condition = '이상없음';
    req.user.id = 1410;
    req.user.role = 3;
    await lendingsController.create(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.OK);
  });

  it('failed 1', async () => {
    req.body.userId = 1111;
    req.body.bookId = 33;
    req.body.condition = '이상없음';
    req.user.id = 2;
    req.user.role = 3;

    await lendingsController.create(req, res, next);
    expect(res.status.mock.calls[1][0]).toBe(status.BAD_REQUEST);
    expect(res.json.mock.calls[1][0].errorCode).toBe(2);
  });
});
