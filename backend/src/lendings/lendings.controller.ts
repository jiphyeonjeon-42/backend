import {
  Request, RequestHandler, Response, NextFunction,
} from 'express';
import * as status from 'http-status';
import ErrorResponse from '../errorResponse';
import * as lendingsService from './lendings.service';

export const create: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
};

export const search: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
  // search 함수
};

export const lendingId: RequestHandler = async (req: Request, res: Response) => {
  // 사서권한 확인추가해야
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

export const returnBook: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
};
