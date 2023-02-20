import { Router } from 'express';
import { stockSearch, stockUpdate } from '../stocks/stocks.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/stock';

export const router = Router();

router.get('/search', authValidate(roleSet.librarian), stockSearch)
  .patch('/update', authValidate(roleSet.librarian), stockUpdate);
