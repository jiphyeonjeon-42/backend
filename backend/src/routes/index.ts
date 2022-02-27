import { Router } from 'express';
export const router = Router();
import * as auth from './auth.routes';
import * as books from './books.routes';
import * as lendings from './lendings.routes';
import * as reservations from './reservations.routes';
import * as returnings from './returnings.routes';
import * as users from './users.routes';

router.use(auth.path, auth.router);
router.use(books.path, books.router);
router.use(lendings.path, lendings.router);
router.use(reservations.path, reservations.router);
router.use(returnings.path, returnings.router);
router.use(users.path, users.router);