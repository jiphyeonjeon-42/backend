import * as jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '../users/users.service';

export interface FtTypes {
  intra: number;
  login: string;
  imageURL: string;
}

export const issueJwt = (user: User) => {
  const { login, id, imageURL } = user;
  const exp = Date.now() + 15 * 1000 * 60 * 60 * 24;
  const token = jwt.sign({
    login,
    id,
    imageURL,
    exp,
  }, config.jwt.secret, {
    issuer: config.mode === 'local' ? 'localhost' : 'server.42library.kr',
    audience: '42library.kr',
  });
  return { token, exp };
};
