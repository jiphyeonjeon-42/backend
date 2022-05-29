import { Request, RequestHandler, Response } from 'express';
import * as status from 'http-status';
import * as reservationsService from './reservations.service';

export const create: RequestHandler = async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const bookInfoId = Number.parseInt(req.body.bookInfoId, 10);
  if (Number.isNaN(bookInfoId)) {
    res.status(status.BAD_REQUEST).json({ errorCode: 0 });
  }
  const result = await reservationsService.create(id, req.body.bookInfoId);
  switch (result) {
    case reservationsService.ok:
      res.status(status.OK);
      break;
    case reservationsService.invalidInfoId:
      res.status(status.BAD_REQUEST).json({ errorCode: 0 });
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
  const { role, id } = req.user as any;
  const reservationId = Number.parseInt(req.params.reservationId, 10);
  if (Number.isNaN(reservationId)) {
    res.status(status.BAD_REQUEST).json({ errorCode: 0 });
    return;
  }
  let result = '';
  if (role === 3) {
    result = await reservationsService.cancel(reservationId);
  } else {
    result = await reservationsService.userCancel(id, reservationId);
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
  const bookInfoId = parseInt(req.query.bookInfo as string, 10);
  if (Number.isNaN(bookInfoId)) {
    res.status(status.BAD_REQUEST).json({ errorCode: 0 });
  }
  const data = await reservationsService.count(bookInfoId);
  res.send(data);
};

export const userReservations: RequestHandler = async (req: Request, res: Response) => {
  const info = req.query;
  const userId = parseInt(info.id as string, 10);
  if (Number.isNaN(userId)) {
    res.status(status.BAD_REQUEST).json({ errorCode: 0 });
  }
  const data = await reservationsService.userReservations(userId);
  res.send(data);
};
