import { Router } from 'express';
import { postRouter, getRouter } from '../reservations/reservations.controller';

export const path = '/reservations';
export const router = Router();

router.post('/', postRouter).get('/', getRouter);
