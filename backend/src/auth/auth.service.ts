import { sign } from 'jsonwebtoken';
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
  const token = sign({
    login,
    id,
    imageURL,
    exp,
  }, config.jwt.secret);
  return { token, exp };
};
