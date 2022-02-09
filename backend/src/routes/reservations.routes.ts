import { Router } from 'express';
import { create, search } from '../reservations/reservations.controller';

export const path = '/reservations';
export const router = Router();

router.post('/', create).get('/search', search);
