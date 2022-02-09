import { Strategy as FortyTwoStrategy } from 'passport-42';
import config from '../config';

const FtStrategy = new FortyTwoStrategy(
  {
    clientID: config.client.id,
    clientSecret: config.client.secret,
    callbackURL: config.client.redirectURL,
  },
  (accessToken: any, refreshToken: any, profile: any, cb: Function) => {
    const { id, login } = profile._json; // eslint-disable-line no-underscore-dangle
    const imageURL = profile._json.image_url; // eslint-disable-line no-underscore-dangle
    const user = {
      intra: id,
      login,
      imageURL,
      accessToken,
      refreshToken,
    };
    cb(null, user);
  },
);

export default FtStrategy;
