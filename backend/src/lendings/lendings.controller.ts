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

export const lendingId: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  // 사서권한 확인추가해야
  const lendingId = parseInt(req.params.id, 10);
  if (Number.isNaN(lendingId)) {
    next(new ErrorResponse(status.BAD_REQUEST, 'id가 숫자가 아닙니다.'));
  } else {
    const result = await lendingsService.lendingId(lendingId);
    result.length ? res.status(status.OK).json(result[0]) : next(new ErrorResponse(status.BAD_REQUEST, 'id가 유효하지 않습니다'));
  }
};

export const returnBook: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
};
