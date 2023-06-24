import dotenv from 'dotenv';
import { connectOption, oauth42ApiOption, oauthUrlOption } from './env';

dotenv.config();

const config = {
  database: {
    port: 3306,
    ...connectOption,
  },
  client: { ...oauthUrlOption, ...oauth42ApiOption },
};

export default config;
