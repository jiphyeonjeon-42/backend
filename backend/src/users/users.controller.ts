import { Request, RequestHandler, Response } from 'express';
import { searchAllUsers, searchUserByIntraId } from './users.service';

interface Params {
  intraId: string;
  page?: number;
  limit?: number;
}

export const search: RequestHandler = async (req: Request, res: Response) => {
  const { intraId, page = 1, limit = 5 }: Params = req.body;
  if (intraId === '') {
    res.send(searchAllUsers(page, limit));
  }
  const items = JSON.parse(JSON.stringify(await searchUserByIntraId(parseInt(intraId, 10))));
  res.send(items);
};

export const create: RequestHandler = (req: Request, res: Response) => {};
