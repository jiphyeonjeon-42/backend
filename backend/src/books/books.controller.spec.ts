import * as status from 'http-status';
import { pool } from '../mysql';
import * as BooksController from './books.controller';
import ErrorResponse from '../utils/error/errorResponse';

describe('BooksController', () => {
  afterAll(() => {
    pool.end();
  });

  const mockReq = () => {
    const req: any = {};
    req.query = jest.fn().mockReturnValue(req);
    return req;dghja s;dlgka;edjkl tgb
  };
  const mockResp = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('Search book information', async () => {
    const req = mockReq();
    req.query.query = '파이썬';
    req.query.page = '3';
    req.query.limit = '4';
    const res = mockResp();
    const next = jest.fn();
    await BooksController.searchBookInfo(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.OK);
    const [[jsonResult]] = res.json.mock.calls;
    expect(jsonResult).toHaveProperty('items[0].id');
    expect(jsonResult).toHaveProperty('items[0].title');
    expect(jsonResult).toHaveProperty('items[0].author');
    expect(jsonResult).toHaveProperty('items[0].publisher');
    expect(jsonResult).toHaveProperty('items[0].isbn');
    expect(jsonResult).toHaveProperty('items[0].image');
    expect(jsonResult).toHaveProperty('items[0].publishedAt');
    expect(jsonResult).toHaveProperty('items[0].createdAt');
    expect(jsonResult).toHaveProperty('items[0].updatedAt');
    expect(jsonResult).toHaveProperty('categories[0].name');
    expect(jsonResult).toHaveProperty('categories[0].count');
  });

  it('Search book information sorted by title', async () => {
    const req = mockReq();
    req.query.query = '파이썬';
    req.query.sort = 'title';
    req.query.page = '3';
    req.query.limit = '4';
    const res = mockResp();
    const next = jest.fn();
    await BooksController.searchBookInfo(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.OK);
    const [[jsonResult]] = res.json.mock.calls;
    expect(jsonResult).toHaveProperty('items[0].id');
    expect(jsonResult).toHaveProperty('items[0].title');
    expect(jsonResult).toHaveProperty('items[0].author');
    expect(jsonResult).toHaveProperty('items[0].publisher');
    expect(jsonResult).toHaveProperty('items[0].isbn');
    expect(jsonResult).toHaveProperty('items[0].image');
    expect(jsonResult).toHaveProperty('items[0].publishedAt');
    expect(jsonResult).toHaveProperty('items[0].createdAt');
    expect(jsonResult).toHaveProperty('items[0].updatedAt');
    expect(jsonResult).toHaveProperty('categories[0].name');
    expect(jsonResult).toHaveProperty('categories[0].count');
  });

  it('Search book information sorted by time', async () => {
    const req = mockReq();
    req.query.query = '파이썬';
    req.query.sort = 'new';
    req.query.page = '3';
    req.query.limit = '4';
    const res = mockResp();
    const next = jest.fn();
    await BooksController.searchBookInfo(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.OK);
    const [[jsonResult]] = res.json.mock.calls;
    expect(jsonResult).toHaveProperty('items[0].id');
    expect(jsonResult).toHaveProperty('items[0].title');
    expect(jsonResult).toHaveProperty('items[0].author');
    expect(jsonResult).toHaveProperty('items[0].publisher');
    expect(jsonResult).toHaveProperty('items[0].isbn');
    expect(jsonResult).toHaveProperty('items[0].image');
    expect(jsonResult).toHaveProperty('items[0].publishedAt');
    expect(jsonResult).toHaveProperty('items[0].createdAt');
    expect(jsonResult).toHaveProperty('items[0].updatedAt');
    expect(jsonResult).toHaveProperty('categories[0].name');
    expect(jsonResult).toHaveProperty('categories[0].count');
  });

  it('Search book information with category', async () => {
    const req = mockReq();
    req.query.query = '코딩';
    req.query.page = '3';
    req.query.limit = '4';
    req.query.category = 'IT 일반';
    const res = mockResp();
    const next = jest.fn();
    await BooksController.searchBookInfo(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(status.OK);
    const [[jsonResult]] = res.json.mock.calls;
    expect(jsonResult).toHaveProperty('items[0].id');
    expect(jsonResult).toHaveProperty('items[0].title');
    expect(jsonResult).toHaveProperty('items[0].author');
    expect(jsonResult).toHaveProperty('items[0].publisher');
    expect(jsonResult).toHaveProperty('items[0].isbn');
    expect(jsonResult).toHaveProperty('items[0].image');
    expect(jsonResult).toHaveProperty('items[0].publishedAt');
    expect(jsonResult).toHaveProperty('items[0].createdAt');
    expect(jsonResult).toHaveProperty('items[0].updatedAt');
    expect(jsonResult).toHaveProperty('categories[0].name');
    expect(jsonResult).toHaveProperty('categories[0].count');
  });

  it('Search book information fails', async () => {
    const req = mockReq();
    const res = mockResp();
    const next = jest.fn();
    await BooksController.searchBookInfo(req, res, next);
    expect(next.mock.calls[0][0]).toEqual(
      new ErrorResponse(status.BAD_REQUEST, 'query, page, limit 중 하나 이상이 없습니다.'),
    );
  });
});
