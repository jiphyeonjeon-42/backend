import { Request, RequestHandler, Response } from 'express';
import * as status from 'http-status';
import * as lendingsService from './lendings.service';

export const create: RequestHandler = async (req: Request, res: Response) => {
  res.send('lending create');
  // 사서권한 확인
  if (req.role < 3) { res.status(401); }
  const result = await lendingsService.create(
    req.body.userId,
    req.body.bookId,
    req.id,
    req.body.condition,
  );
  // 서비스 가져와서?
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

export const search: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
  // search 함수
};
export const booksId: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
  // search 함수
};

export const returnBook: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
};
