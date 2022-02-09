import { Router } from 'express';
import passport from 'passport';
import { getOAuth, getToken } from './auth.controller';
import FtStrategy from './auth.strategy';

export const path = '/auth';
export const router = Router();

passport.use('42', FtStrategy);

router.get('/oauth', getOAuth);
router.get('/token', passport.authenticate('42', { session: false }), getToken);
// router.get('/me');
// router.get('/logout');
