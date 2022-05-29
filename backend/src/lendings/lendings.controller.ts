import { Request, RequestHandler, Response } from 'express';
import * as status from 'http-status';
import * as lendingsService from './lendings.service';

export const create: RequestHandler = async (req: Request, res: Response) => {
  const { id } = req.user as any;
  if (!req.body.userId || !req.body.bookId) {
    res.status(400).json({ errorCode: 0 });
  }
  const result = await lendingsService.create(
    req.body.userId,
    req.body.bookId,
    id,
    req.body.condition,
  );

  switch (result) {
    case lendingsService.ok:
      res.status(status.OK);
      break;
    case lendingsService.noUserId:
      res.status(400).json({ errorCode: 1 });
      break;
    case lendingsService.noPermission:
      res.status(400).json({ errorCode: 2 });
      break;
    case lendingsService.lendingOverload:
      res.status(400).json({ errorCode: 3 });
      break;
    case lendingsService.lendingOverdue:
      res.status(400).json({ errorCode: 4 });
      break;
    case lendingsService.onLending:
      res.status(400).json({ errorCode: 5 });
      break;
    case lendingsService.onReservation:
      res.status(400).json({ errorCode: 6 });
      break;
    case lendingsService.lostBook:
      res.status(400).json({ errorCode: 7 });
      break;
    case lendingsService.damagedBook:
      res.status(400).json({ errorCode: 8 });
      break;
    default:
      res.status(500);
  }
  if (result === lendingsService.ok) {
    res.status(status.OK);
  } else if (result === lendingsService.lendingOverload) {
    res.status(400).json({ errorCode: 1 });
  } else if (result === lendingsService.lendingOverdue) {
    res.status(400).json({ errorCode: 2 });
  } else if (result === lendingsService.onLending) {
    res.status(400).json({ errorCode: 3 });
  } else if (result === lendingsService.onReservation) {
    res.status(400).json({ errorCode: 4 });
  } else if (result === lendingsService.lostBook) {
    res.status(400).json({ errorCode: 5 });
  } else if (result === lendingsService.damagedBook) {
    res.status(400).json({ errorCode: 6 });
  } else {
    res.status(500);
  }
};

const argumentCheck = (sort:string, type:string) => {
  if (sort !== 'new' && sort !== 'old') { return 0; }
  if (type !== 'user' && type !== 'title' && type !== 'callSign' && type !== 'all') { return 0; }
  return 1;
};

export const search: RequestHandler = async (req: Request, res: Response) => {
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

export const lendingId: RequestHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(status.BAD_REQUEST);
  } else {
    const result = await lendingsService.lendingId(id);
    if (result.length) {
      res.status(status.OK).json(result[0]);
    } else {
      res.status(status.BAD_REQUEST);
    }
  }
};

export const returnBook: RequestHandler = async (req: Request, res: Response) => {
  const { id } = req.user as any;
  if (!req.body.lendingId || req.body.condition) {
    res.status(401).json({ errorCode: 1 });
  }
  const result = await lendingsService.returnBook(
    id,
    req.body.lendingId,
    req.body.condition,
  );

  if (result === lendingsService.ok) {
    res.status(status.OK);
  } else if (result === lendingsService.nonexistentLending) {
    res.status(400).json({ errorCode: 2 });
  } else if (result === lendingsService.alreadyReturned) {
    res.status(400).json({ errorCode: 3 });
  } else {
    res.status(500);
  }
};
