import { Request, RequestHandler, Response } from 'express';
import * as status from 'http-status';
import * as reservationsService from './reservations.service';

export const create: RequestHandler = async (req: Request, res: Response) => {
  if (!req.role) {
    res.status(status.UNAUTHORIZED);
    return;
  }
  const bookInfoId = Number.parseInt(req.body.bookInfoId, 10);
  if (Number.isNaN(bookInfoId)) {
    res.status(status.BAD_REQUEST).json({ errorCode: 0 });
  }
  const result = await reservationsService.create(req.user.id, req.body.bookInfoId);
  switch (result) {
    case reservationsService.ok:
      res.status(status.OK);
      break;
    case reservationsService.notLended:
      res.status(status.BAD_REQUEST).json({ errorCode: 1 });
      break;
    case reservationsService.alreadyReserved:
      res.status(status.BAD_REQUEST).json({ errorCode: 2 });
      break;
    case reservationsService.moreThanTwoReservations:
      res.status(status.BAD_REQUEST).json({ errorCode: 3 });
      break;
    case reservationsService.alreadyLended:
      res.status(status.BAD_REQUEST).json({ errorCode: 4 });
      break;
    default:
      res.status(status.INTERNAL_SERVER_ERROR);
  }
};

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
  const info = req.query;
  const query = info.query as string ? info.query as string : '';
  const page = parseInt(info.page as string, 10) ? parseInt(info.page as string, 10) - 1 : 0;
  const limit = parseInt(info.limit as string, 10) ? parseInt(info.limit as string, 10) : 5;
  const filter = info.filter as string;
  if (!filterCheck(filter)) { res.status(status.BAD_REQUEST); }
  const result = await reservationsService
    .search(query, page, limit, filter);
  res.send(result);
};

export const cancel: RequestHandler = async (req: Request, res: Response) => {
  const reservationId = Number.parseInt(req.params.reservationId, 10);
  if (Number.isNaN(reservationId)) {
    res.status(status.BAD_REQUEST).json({ errorCode: 0 });
    return;
  }
  let result = '';
  if (req.role === 3) {
    result = await reservationsService.cancel(reservationId);
  } else {
    result = await reservationsService.userCancel(req.user.id, reservationId);
  }
  switch (result) {
    case (reservationsService.ok):
      res.status(status.OK);
      break;
    case (reservationsService.notMatchingUser):
      res.status(status.BAD_REQUEST).json({ errorCode: 1 });
      break;
    case (reservationsService.reservationNotExist):
      res.status(status.BAD_REQUEST).json({ errorCode: 2 });
      break;
    case (reservationsService.notReserved):
      res.status(status.BAD_REQUEST).json({ errorCode: 3 });
      break;
    default:
  }
};

export const count: RequestHandler = async (req: Request, res: Response) => {
  const info = req.query;
  const bookInfoId = info.bookInfo as string;
  const data = await reservationsService.count(bookInfoId);
  res.send(data);
};

export const userReservations: RequestHandler = async (req: Request, res: Response) => {
  const info = req.query;
  const userId = info.id as string;
  const data = await reservationsService.userReservations(userId);
  res.send(data);
};
