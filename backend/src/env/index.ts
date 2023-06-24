import dotenv from 'dotenv';
import { getConnectOption } from './getConnectOption';
import { getModeOption } from './modeSchema';
import { getNaverBookApiOption } from './naverBookApiOption';
import { getOauth42ApiOption, getOauthUrlOption } from './oauth42ApiSchema';

// .env 파일을 읽어서 process.env에 추가
dotenv.config();

export const connectMode = getModeOption(process.env);
export const connectOption = getConnectOption(connectMode)(process.env);
export const oauthUrlOption = getOauthUrlOption(process.env);
export const oauth42ApiOption = getOauth42ApiOption(process.env);
export const naverBookApiOption = getNaverBookApiOption(process.env);
