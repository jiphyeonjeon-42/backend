import { Request, RequestHandler, Response } from 'express';

export const postRouter: RequestHandler = (req: Request, res: Response) => {};

export const getRouter: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
  //search 함수
};
