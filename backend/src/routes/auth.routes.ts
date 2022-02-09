import { Router } from 'express';
import { postRouter, getRouter } from '../auth/auth.controller';

export const path = '/auth';
export const router = Router();

router.post('/logout', postRouter).get('/me', getRouter);
