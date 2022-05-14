import { Request, RequestHandler, Response } from 'express';
import { searchAllUsers, searchUserByIntraId } from './users.service';

interface Params {
  intraId: string;
  page?: number;
  limit?: number;
}

export const search: RequestHandler = (req: Request, res: Response) => {
  const { intraId, page = 1, limit = 5 }: Params = req.body.params;

  if (intraId === '') {
    return res.send(searchAllUsers(page, limit));
  }
  return res.send(searchUserByIntraId(intraId, page, limit));
};

export const create: RequestHandler = (req: Request, res: Response) => {};
