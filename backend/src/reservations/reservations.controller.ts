import { Request, RequestHandler, Response } from 'express';
import * as status from 'http-status';
import * as reservationsService from './reservations.service';
import { ReservationsPageInfo } from '../paginate';

export const create: RequestHandler = async (req: Request, res: Response) => {
  if (!req.role) {
    res.status(status.UNAUTHORIZED);
    return;
  }
  const bookInfoId = Number.parseInt(req.body.bookInfoId, 10);
  if (Number.isNaN(bookInfoId)) {
    res.status(status.BAD_REQUEST).json({ errorCode: 0 });
  }
  const result = await reservationsService.create(req.id, req.body.bookInfoId);
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

export const search: RequestHandler = async (req: Request, res: Response) => {
  const info = req.query;
  const page = info.page as string ? info.page as string : '1';
  const limit = info.limit as string ? info.limit as string : '5';
  const filter = info.filter as string[];
  const p :ReservationsPageInfo = new ReservationsPageInfo(page, limit, filter);
  const data = await reservationsService
    .search(p.getPage(), p.getLimit(), p.getFilter());
  res.send(data);
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
    result = await reservationsService.userCancel(req.id, reservationId);
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
