import { Request, RequestHandler, Response } from 'express';

export const create: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
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
