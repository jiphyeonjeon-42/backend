import dotenv from 'dotenv';
import { getConnectOption } from './getConnectOption';

// .env 파일을 읽어서 process.env에 추가
dotenv.config();
export const connectOption = getConnectOption(process.env);
