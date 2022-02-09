import { Request, RequestHandler, Response } from 'express';

export const create: RequestHandler = (req: Request, res: Response) => {};

export const getRouter: RequestHandler = (req: Request, res: Response) => {
  res.send('hello express');
};

