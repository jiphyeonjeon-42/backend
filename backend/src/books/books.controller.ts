import { Request, RequestHandler, Response } from 'express';

export const infoSearch: RequestHandler = (req: Request, res: Response) => {};

export const infoId: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
  //search 함수
};
export const info: RequestHandler = (req: Request, res: Response) => {};

export const booker: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
  //search 함수
};

export const search: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
};
