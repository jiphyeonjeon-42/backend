import dotenv from 'dotenv';
import { connectOption, oauth42ApiOption, oauthUrlOption } from './env';

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV,
  mode: process.env.MODE,
  database: {
    port: 3306,
    ...connectOption,
  },
  client: { ...oauthUrlOption, ...oauth42ApiOption },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'secret',
  },
};

export default config;
