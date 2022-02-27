import { Router } from 'express';
import { create, getRouter } from '../returnings/returnings.controller';

export const path = '/returnings';
export const router = Router();

router.post('/', create).get('/', getRouter);;
