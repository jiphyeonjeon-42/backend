import { Request, RequestHandler, Response } from 'express';
import * as status from 'http-status';
import * as lendingsService from './lendings.service';

export const create: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
};

const argumentCheck = (sort:string, type:string) => {
  if (sort !== 'new' && sort !== 'old') { return 0; }
  if (type !== 'user' && type !== 'title' && type !== 'callSign' && type !== 'all') { return 0; }
  return 1;
};

export const search: RequestHandler = async (req: Request, res: Response) => {
  // 사서 권한 확인 필요
  const info = req.query;
  const query = info.query as string;
  const page = parseInt(info.page as string, 10) ? parseInt(info.page as string, 10) - 1 : 0;
  const limit = parseInt(info.limit as string, 10) ? parseInt(info.limit as string, 10) : 5;
  const sort = info.sort as string;
  const type = info.type as string ? info.type as string : 'all';
  if (!argumentCheck(sort, type)) res.status(400);
  const result = await lendingsService.search(query, page, limit, sort, type);
  res.send({ items: result });
};

export const booksId: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
  // search 함수
};

export const returnBook: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
};
