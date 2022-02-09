import { Router } from 'express';
import { infoSearch, infoId, info, booker, search } from '../books/books.controller';

export const path = '/books';
export const router = Router();

router.get('/info/search', infoSearch)
        .get('/info/:id', infoId)
        .get('/info', info)
        .get('/:id/reservations/count', booker)
        .get('/search', search);
