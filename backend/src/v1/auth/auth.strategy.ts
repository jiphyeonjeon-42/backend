import { Request } from 'express';
import { Strategy as FortyTwoStrategy } from 'passport-42';
import { ExtractJwt, Strategy as JWTStrategy, VerifiedCallback } from 'passport-jwt';
import { jwtOption, oauth42ApiOption, oauthUrlOption } from '../../config';

const credentials = {
  clientID: oauth42ApiOption.id,
  clientSecret: oauth42ApiOption.secret,
};

export const FtStrategy = new FortyTwoStrategy(
  {
    ...credentials,
    callbackURL: `${oauthUrlOption.redirectURL}/api/auth/token`,
  },
  (accessToken: any, refreshToken: any, profile: any, cb: Function) => {
    const { id, login } = profile._json; // eslint-disable-line no-underscore-dangle
    const user = {
      id,
      nickName: login,
    };
    cb(null, user);
  },
);

export const FtAuthentication = new FortyTwoStrategy(
  {
    ...credentials,
    callbackURL: `${oauthUrlOption.redirectURL}/api/auth/intraAuthentication`,
  },
  (accessToken: any, refreshToken: any, profile: any, cb: Function) => {
    const { id, login } = profile._json; // eslint-disable-line no-underscore-dangle
    const user = {
      intraId: id,
      nickName: login,
    };
    cb(null, user);
  },
);

export const JwtStrategy = new JWTStrategy(
  {
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req: Request) => req?.cookies?.access_token,
    ]),
    secretOrKey: jwtOption.secret,
    ignoreExpiration: false,
    issuer: jwtOption.issuer,
    passReqToCallback: true,
  },
  (req: Request, payload: any, done: VerifiedCallback) => {
    const user = {
      intraProfile: req.user,
      id: payload.id,
    };
    done(null, user);
  },
);
