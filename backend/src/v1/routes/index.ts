import { Router } from 'express';
import * as auth from './auth.routes';
import * as books from './books.routes';
import * as lendings from './lendings.routes';
import * as reservations from './reservations.routes';
import * as users from './users.routes';
import * as histories from './histories.routes';
import * as reviews from './reviews.routes';
import * as bookInfoReviews from './bookInfoReviews.routes';
import * as stock from './stock.routes';
import * as tags from './tags.routes';
import * as cursus from './cursus.routes';
import * as searchKeywords from './searchKeywords.routes';

const router = Router();

//  ELB healthcheck 를 위한 /api/health endpoint
router.get('/health', (req, res) => {
  res.status(200).send();
});
router.use(auth.path, auth.router);
router.use(books.path, books.router);
router.use(lendings.path, lendings.router);
router.use(reservations.path, reservations.router);
router.use(users.path, users.router);
router.use(histories.path, histories.router);
router.use(reviews.path, reviews.router);
router.use(histories.path, histories.router);
router.use(bookInfoReviews.path, bookInfoReviews.router);
router.use(stock.path, stock.router);
router.use(tags.path, tags.router);
router.use(cursus.path, cursus.router);
router.use(searchKeywords.path, searchKeywords.router);

export default router;
