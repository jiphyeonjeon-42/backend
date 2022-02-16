import { Router } from 'express';
import passport from 'passport';
import { getOAuth, getToken } from './auth.controller';
import { FtStrategy, JwtStrategy } from './auth.strategy';

export const path = '/auth';
export const router = Router();

passport.use('42', FtStrategy);
passport.use('jwt', JwtStrategy);

router.get('/oauth', getOAuth);
router.get('/token', passport.authenticate('42', { session: false }), getToken);
router.get('/me', passport.authenticate('jwt', { session: false }));
// router.get('/logout');
