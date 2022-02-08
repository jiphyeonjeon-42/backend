import { Router } from 'express';
export const router = Router();
import * as reservations from './reservations.routes';

router.use(reservations.path, reservations.router);
