import dotenv from 'dotenv';
import { getConnectOption } from './getConnectOption';
import { getOauth42ApiOption } from './oauth42ApiSchema';
import { getNaverBookApiOption } from './naverBookApiOption';

// .env 파일을 읽어서 process.env에 추가
dotenv.config();
export const connectOption = getConnectOption(process.env);
export const oauth42ApiOption = getOauth42ApiOption(process.env);
export const naverBookApiOption = getNaverBookApiOption(process.env);
