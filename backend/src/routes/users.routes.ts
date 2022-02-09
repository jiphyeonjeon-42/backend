import { Router } from 'express';
import { create, search } from '../users/users.controller';

export const path = '/users';
export const router = Router();

router.post('/', create).get('/', search);
