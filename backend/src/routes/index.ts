import { Router } from 'express';
import * as auth from './auth.routes';
import * as books from './books.routes';
import * as lendings from './lendings.routes';
import * as reservations from './reservations.routes';
import * as users from './users.routes';
import * as review from './review.routes';
import * as histories from './histories.routes';

const router = Router();

router.use(auth.path, auth.router);
router.use(books.path, books.router);
router.use(lendings.path, lendings.router);
router.use(reservations.path, reservations.router);
router.use(users.path, users.router);
router.use(review.path, review.router);
router.use(histories.path, histories.router);

export default router;
