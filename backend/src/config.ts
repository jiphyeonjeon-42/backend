import dotenv from 'dotenv';
import { oauth42ApiOption, oauthUrlOption } from './env';

dotenv.config();

const config = {
  client: { ...oauthUrlOption, ...oauth42ApiOption },
};

export default config;
