import { Router } from 'express';
import { create, search, booksId } from '../lendings/lendings.controller';

export const path = '/lendings';
export const router = Router();

router.post('/', create).get('/search', search).get('/:id', booksId);
