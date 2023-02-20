import { Router } from 'express';
import { stockSearch, stockUpdate } from '../stocks/stocks.controller';

export const path = '/stock';

export const router = Router();

router.get('/search', stockSearch)
  .patch('/update', stockUpdate);
