import { Request } from 'express';
import { Strategy as FortyTwoStrategy } from 'passport-42';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import config from '../config';

export const FtStrategy = new FortyTwoStrategy(
  {
    clientID: config.client.id,
    clientSecret: config.client.secret,
    callbackURL: config.client.redirectURL,
  },
  (accessToken: any, refreshToken: any, profile: any, cb: Function) => {
    const { id } = profile._json; // eslint-disable-line no-underscore-dangle
    const user = {
      id,
    };
    cb(null, user);
  },
);

export const JwtStrategy = new JWTStrategy(
  {
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req: Request) => req?.cookies?.access_token,
    ]),
    secretOrKey: config.jwt.secret,
    ignoreExpiration: false,
    issuer: config.mode === 'local' ? 'localhost' : 'server.42library.kr',
  },
  (payload, done) => {
    const user = {
      id: payload.id,
    };
    done(null, user);
  },
);
