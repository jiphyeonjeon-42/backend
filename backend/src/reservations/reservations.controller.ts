import { Request, RequestHandler, Response } from 'express';
import * as reservationsService from './reservations.service';

export const create: RequestHandler = (req: Request, res: Response) => {};

const filterCheck = (argument: string) => {
  switch (argument) {
    case 'pending':
    case 'waiting':
    case 'expired':
    case 'all':
      return 1;
    default:
      return 0;
  }
};

export const search: RequestHandler = async (req: Request, res: Response) => {
  // 사서 권한 체크 필요
  const info = req.query;
  const query = info.query as string ? info.query as string : '';
  const page = parseInt(info.page as string, 10) ? parseInt(info.page as string, 10) - 1 : 0;
  const limit = parseInt(info.limit as string, 10) ? parseInt(info.limit as string, 10) : 5;
  const filter = info.filter as string;
  if (!filterCheck) { res.status(400); }
  const result = await reservationsService
    .searchReservation(query, page, limit, filter);
  res.send(result);
};
