import dotenv from 'dotenv';
import { connectOption } from './env';

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV,
  mode: process.env.MODE,
  database: {
    port: 3306,
    ...connectOption,
  },
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
    redirectURL: process.env.REDIRECT_URL ?? 'https://server.42library.kr',
    clientURL: process.env.CLIENT_URL ?? 'https://42library.kr',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'secret',
  },
};

export default config;
