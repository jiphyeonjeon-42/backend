import dotenv from 'dotenv';
import { getConnectOption } from './getConnectOption';
import { getOauth42ApiOption } from './oauth42ApiSchema';

// .env 파일을 읽어서 process.env에 추가
dotenv.config();
export const connectOption = getConnectOption(process.env);
export const oauth42ApiOption = getOauth42ApiOption(process.env);
